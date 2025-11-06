"use client";

import { useState } from "react";
import { TestRun, BatchTestResult } from "@/lib/types";
import { useTestHistory } from "@/lib/hooks/useTestHistory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  History,
  Trash2,
  Eye,
  Download,
  Clock,
  FileText,
  Coins,
  TrendingUp,
} from "lucide-react";

interface TestHistoryViewerProps {
  onLoadResults?: (results: BatchTestResult[]) => void;
}

export function TestHistoryViewer({ onLoadResults }: TestHistoryViewerProps) {
  const { testRuns, deleteTestRun, clearHistory } = useTestHistory();
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);

  const handleViewResults = (run: TestRun) => {
    setSelectedRun(run);
    onLoadResults?.(run.results);
  };

  const handleExportRun = (run: TestRun) => {
    const dataStr = JSON.stringify(run, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `test-run-${run.name.replace(/\s+/g, "-")}-${
      run.id.slice(0, 8)
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Test run exported");
  };

  const handleDeleteRun = (id: string) => {
    if (confirm("Are you sure you want to delete this test run?")) {
      deleteTestRun(id);
      toast.success("Test run deleted");
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear all test history? This cannot be undone."
      )
    ) {
      clearHistory();
      toast.success("Test history cleared");
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5" />
                Test History
              </h2>
              <p className="text-sm text-muted-foreground">
                {testRuns.length} test run{testRuns.length !== 1 ? "s" : ""}
              </p>
            </div>
            {testRuns.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {testRuns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <History className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    No test runs yet. Run a batch test to see history.
                  </p>
                </CardContent>
              </Card>
            ) : (
              testRuns.map((run) => (
                <Card key={run.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{run.name}</CardTitle>
                        {run.description && (
                          <CardDescription className="mt-1">
                            {run.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewResults(run)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportRun(run)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRun(run.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">
                        {run.config.provider} · {run.config.model}
                      </Badge>
                      <span className="text-muted-foreground">
                        {run.config.promptCount} prompt
                        {run.config.promptCount !== 1 ? "s" : ""} ×{" "}
                        {run.config.testCaseCount} test
                        {run.config.testCaseCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Avg Time
                          </p>
                          <p className="font-medium">
                            {run.summary.avgResponseTime}ms
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Tokens
                          </p>
                          <p className="font-medium">
                            {run.summary.totalTokens.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {run.summary.totalCost > 0 && (
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total Cost
                            </p>
                            <p className="font-medium">
                              ${run.summary.totalCost.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tests</p>
                          <p className="font-medium">{run.summary.totalTests}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(run.timestamp).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedRun?.name}</DialogTitle>
            <DialogDescription>
              {selectedRun?.description || "Test run details"}
            </DialogDescription>
          </DialogHeader>
          {selectedRun && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-medium">
                        {selectedRun.config.provider}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">
                        {selectedRun.config.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        System Prompts
                      </span>
                      <span className="font-medium">
                        {selectedRun.config.promptCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Test Cases</span>
                      <span className="font-medium">
                        {selectedRun.config.testCaseCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tests</span>
                      <span className="font-medium">
                        {selectedRun.summary.totalTests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Avg Response Time
                      </span>
                      <span className="font-medium">
                        {selectedRun.summary.avgResponseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Tokens
                      </span>
                      <span className="font-medium">
                        {selectedRun.summary.totalTokens.toLocaleString()}
                      </span>
                    </div>
                    {selectedRun.summary.totalCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Cost
                        </span>
                        <span className="font-medium">
                          ${selectedRun.summary.totalCost.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      onLoadResults?.(selectedRun.results);
                      setSelectedRun(null);
                      toast.success("Results loaded in comparison view");
                    }}
                    className="flex-1"
                  >
                    Load in Comparison View
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportRun(selectedRun)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
