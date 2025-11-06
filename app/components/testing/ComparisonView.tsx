"use client";

import { useState } from "react";
import { BatchTestResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Coins, FileText, BarChart3, Download } from "lucide-react";

interface ComparisonViewProps {
  results: BatchTestResult[];
}

export function ComparisonView({ results }: ComparisonViewProps) {
  // Group results by test case
  const testCaseGroups = results.reduce(
    (acc, result) => {
      const key = result.testCaseId;
      if (!acc[key]) {
        acc[key] = {
          testCaseName: result.testCaseName,
          results: [],
        };
      }
      acc[key].results.push(result);
      return acc;
    },
    {} as Record<
      string,
      { testCaseName: string; results: BatchTestResult[] }
    >
  );

  const [selectedTestCase, setSelectedTestCase] = useState<string>(
    Object.keys(testCaseGroups)[0] || ""
  );

  const currentResults = selectedTestCase
    ? testCaseGroups[selectedTestCase]?.results || []
    : [];

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `batch-test-results-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (results.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              No test results yet. Run a batch test to see comparisons.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Comparison View</h2>
            <p className="text-sm text-muted-foreground">
              {results.length} test result{results.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={exportResults}>
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>

        {Object.keys(testCaseGroups).length > 1 && (
          <div className="mt-4">
            <Select value={selectedTestCase} onValueChange={setSelectedTestCase}>
              <SelectTrigger>
                <SelectValue placeholder="Select test case" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(testCaseGroups).map(([id, group]) => (
                  <SelectItem key={id} value={id}>
                    {group.testCaseName} ({group.results.length} results)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs defaultValue="side-by-side" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="side-by-side" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
              {currentResults.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {result.promptTemplateName}
                    </CardTitle>
                    <CardDescription>
                      {result.provider} · {result.model}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Response</h4>
                      <div className="rounded-md border bg-muted/50 p-3">
                        <pre className="whitespace-pre-wrap text-xs">
                          {result.response}
                        </pre>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Response Time
                          </p>
                          <p className="font-medium">
                            {result.metrics.responseTime}ms
                          </p>
                        </div>
                      </div>

                      {result.metrics.tokens && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Tokens
                            </p>
                            <p className="font-medium">
                              {result.metrics.tokens.total}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.metrics.cost && (
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Cost</p>
                            <p className="font-medium">
                              ${result.metrics.cost.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentResults.length > 0 && (
                      <>
                        <div>
                          <h4 className="mb-3 text-sm font-medium">
                            Response Times
                          </h4>
                          <div className="space-y-2">
                            {currentResults.map((result) => (
                              <div
                                key={result.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {result.promptTemplateName}
                                </span>
                                <Badge variant="outline">
                                  {result.metrics.responseTime}ms
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between text-sm font-medium">
                              <span>Average</span>
                              <span>
                                {Math.round(
                                  currentResults.reduce(
                                    (sum, r) => sum + r.metrics.responseTime,
                                    0
                                  ) / currentResults.length
                                )}
                                ms
                              </span>
                            </div>
                          </div>
                        </div>

                        {currentResults.some((r) => r.metrics.tokens) && (
                          <div>
                            <h4 className="mb-3 text-sm font-medium">
                              Token Usage
                            </h4>
                            <div className="space-y-2">
                              {currentResults
                                .filter((r) => r.metrics.tokens)
                                .map((result) => (
                                  <div
                                    key={result.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-muted-foreground">
                                      {result.promptTemplateName}
                                    </span>
                                    <Badge variant="outline">
                                      {result.metrics.tokens?.total} tokens
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {currentResults.some((r) => r.metrics.cost) && (
                          <div>
                            <h4 className="mb-3 text-sm font-medium">Cost</h4>
                            <div className="space-y-2">
                              {currentResults
                                .filter((r) => r.metrics.cost)
                                .map((result) => (
                                  <div
                                    key={result.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-muted-foreground">
                                      {result.promptTemplateName}
                                    </span>
                                    <Badge variant="outline">
                                      ${result.metrics.cost?.toFixed(4)}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex justify-between text-sm font-medium">
                                <span>Total Cost</span>
                                <span>
                                  $
                                  {currentResults
                                    .reduce(
                                      (sum, r) => sum + (r.metrics.cost || 0),
                                      0
                                    )
                                    .toFixed(4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Winner Analysis</CardTitle>
                  <CardDescription>
                    Based on response time and token efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentResults.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Fastest Response
                        </p>
                        <p className="font-medium">
                          {
                            currentResults.reduce((prev, curr) =>
                              prev.metrics.responseTime <
                              curr.metrics.responseTime
                                ? prev
                                : curr
                            ).promptTemplateName
                          }
                        </p>
                      </div>
                      {currentResults.some((r) => r.metrics.tokens) && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Most Token Efficient
                          </p>
                          <p className="font-medium">
                            {
                              currentResults
                                .filter((r) => r.metrics.tokens)
                                .reduce((prev, curr) =>
                                  (prev.metrics.tokens?.total || Infinity) <
                                  (curr.metrics.tokens?.total || Infinity)
                                    ? prev
                                    : curr
                                ).promptTemplateName
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
