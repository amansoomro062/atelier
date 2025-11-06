"use client";

import { useState } from "react";
import { SystemPromptTemplate, TestCase, BatchTestResult } from "@/lib/types";
import { useTestCases } from "@/lib/hooks/useTestCases";
import { useApiKeys } from "@/lib/hooks/useApiKeys";
import { useTestHistory } from "@/lib/hooks/useTestHistory";
import { runBatchTest, calculateMetrics } from "@/lib/utils/batchTesting";
import { getModelsForProvider, DEFAULT_MODELS } from "@/lib/config/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus,
  Play,
  Trash2,
  Edit2,
  FlaskConical,
  Loader2,
  Check,
} from "lucide-react";

interface BatchTestingPanelProps {
  selectedPrompts: SystemPromptTemplate[];
  onResultsReady: (results: BatchTestResult[]) => void;
}

export function BatchTestingPanel({
  selectedPrompts,
  onResultsReady,
}: BatchTestingPanelProps) {
  const { testCases, addTestCase, updateTestCase, deleteTestCase } =
    useTestCases();
  const { apiKeys } = useApiKeys();
  const { addTestRun } = useTestHistory();

  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(
    new Set()
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [newTestCase, setNewTestCase] = useState({
    name: "",
    userPrompt: "",
    expectedBehavior: "",
    tags: "",
  });

  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [model, setModel] = useState(DEFAULT_MODELS.openai);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [evaluateQuality, setEvaluateQuality] = useState(true);

  const handleAddTestCase = () => {
    if (!newTestCase.name || !newTestCase.userPrompt) {
      toast.error("Name and user prompt are required");
      return;
    }

    addTestCase({
      name: newTestCase.name,
      userPrompt: newTestCase.userPrompt,
      expectedBehavior: newTestCase.expectedBehavior,
      tags: newTestCase.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setNewTestCase({
      name: "",
      userPrompt: "",
      expectedBehavior: "",
      tags: "",
    });
    setIsAddDialogOpen(false);
    toast.success("Test case added successfully");
  };

  const handleUpdateTestCase = () => {
    if (!editingTestCase) return;

    updateTestCase(editingTestCase.id, {
      name: editingTestCase.name,
      userPrompt: editingTestCase.userPrompt,
      expectedBehavior: editingTestCase.expectedBehavior,
      tags: editingTestCase.tags,
    });

    setEditingTestCase(null);
    toast.success("Test case updated successfully");
  };

  const handleToggleTestCase = (testCaseId: string) => {
    const newSelected = new Set(selectedTestCases);
    if (newSelected.has(testCaseId)) {
      newSelected.delete(testCaseId);
    } else {
      newSelected.add(testCaseId);
    }
    setSelectedTestCases(newSelected);
  };

  const handleRunTests = async () => {
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one system prompt");
      return;
    }

    if (selectedTestCases.size === 0) {
      toast.error("Please select at least one test case");
      return;
    }

    const apiKey = provider === "openai" ? apiKeys.openai : apiKeys.anthropic;
    if (!apiKey) {
      toast.error(`Please add your ${provider} API key in settings`);
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setTotal(selectedPrompts.length * selectedTestCases.size);

    try {
      const selectedTests = testCases.filter((tc) =>
        selectedTestCases.has(tc.id)
      );

      const results = await runBatchTest(selectedPrompts, selectedTests, {
        provider,
        model,
        apiKey,
        evaluateQuality,
        onProgress: (completed, total) => {
          setProgress(completed);
          setTotal(total);
        },
      });

      const metrics = calculateMetrics(results);
      toast.success(
        `Completed ${results.length} tests in ${Math.round(
          metrics.totalResponseTime / 1000
        )}s`
      );

      // Save to history
      addTestRun({
        name: `Test Run - ${new Date().toLocaleString()}`,
        description: `${selectedPrompts.length} prompts × ${selectedTests.length} test cases`,
        results,
        config: {
          provider,
          model,
          promptCount: selectedPrompts.length,
          testCaseCount: selectedTests.length,
        },
        summary: {
          totalTests: results.length,
          avgResponseTime: metrics.avgResponseTime,
          totalTokens: metrics.totalTokens,
          totalCost: 0, // Calculate if needed
        },
      });

      onResultsReady(results);
    } catch (error) {
      console.error("Batch test error:", error);
      toast.error("Failed to run batch tests");
    } finally {
      setIsRunning(false);
      setProgress(0);
      setTotal(0);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Batch Testing</h2>
          <p className="text-sm text-muted-foreground">
            {selectedPrompts.length} prompt{selectedPrompts.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(v) => {
                  setProvider(v as "openai" | "anthropic");
                  setModel(DEFAULT_MODELS[v as "openai" | "anthropic"]);
                }}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getModelsForProvider(provider).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="evaluate-quality"
              checked={evaluateQuality}
              onChange={(e) => setEvaluateQuality(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="evaluate-quality" className="text-sm font-normal cursor-pointer">
              Enable quality scoring (adds ~100ms per test)
            </Label>
          </div>

          <Button
            onClick={handleRunTests}
            disabled={isRunning || selectedPrompts.length === 0}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests ({progress}/{total})
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Batch Tests
              </>
            )}
          </Button>

          {isRunning && (
            <Progress value={(progress / total) * 100} className="w-full" />
          )}
        </div>
      </div>

      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Test Cases</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTestCases.size} selected
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Test Case
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Test Case</DialogTitle>
                <DialogDescription>
                  Create a new test case to run against your prompts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tc-name">Name</Label>
                  <Input
                    id="tc-name"
                    value={newTestCase.name}
                    onChange={(e) =>
                      setNewTestCase({ ...newTestCase, name: e.target.value })
                    }
                    placeholder="e.g., Code Generation Test"
                  />
                </div>
                <div>
                  <Label htmlFor="tc-prompt">User Prompt</Label>
                  <Textarea
                    id="tc-prompt"
                    value={newTestCase.userPrompt}
                    onChange={(e) =>
                      setNewTestCase({
                        ...newTestCase,
                        userPrompt: e.target.value,
                      })
                    }
                    placeholder="The prompt to test with..."
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="tc-expected">Expected Behavior (optional)</Label>
                  <Textarea
                    id="tc-expected"
                    value={newTestCase.expectedBehavior}
                    onChange={(e) =>
                      setNewTestCase({
                        ...newTestCase,
                        expectedBehavior: e.target.value,
                      })
                    }
                    placeholder="What you expect the AI to do..."
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="tc-tags">Tags (comma-separated)</Label>
                  <Input
                    id="tc-tags"
                    value={newTestCase.tags}
                    onChange={(e) =>
                      setNewTestCase({ ...newTestCase, tags: e.target.value })
                    }
                    placeholder="e.g., coding, generation"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTestCase}>Add Test Case</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {testCases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FlaskConical className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  No test cases yet. Add one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            testCases.map((testCase) => (
              <Card
                key={testCase.id}
                className={`cursor-pointer transition-colors ${
                  selectedTestCases.has(testCase.id)
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => handleToggleTestCase(testCase.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {selectedTestCases.has(testCase.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {testCase.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTestCase(testCase)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this test case?"
                            )
                          ) {
                            deleteTestCase(testCase.id);
                            toast.success("Test case deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {testCase.userPrompt}
                  </p>
                  {testCase.expectedBehavior && (
                    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                      Expected: {testCase.expectedBehavior}
                    </p>
                  )}
                  {testCase.tags && testCase.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {testCase.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Test Case Dialog */}
      <Dialog
        open={!!editingTestCase}
        onOpenChange={() => setEditingTestCase(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
          </DialogHeader>
          {editingTestCase && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingTestCase.name}
                  onChange={(e) =>
                    setEditingTestCase({
                      ...editingTestCase,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-prompt">User Prompt</Label>
                <Textarea
                  id="edit-prompt"
                  value={editingTestCase.userPrompt}
                  onChange={(e) =>
                    setEditingTestCase({
                      ...editingTestCase,
                      userPrompt: e.target.value,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="edit-expected">Expected Behavior</Label>
                <Textarea
                  id="edit-expected"
                  value={editingTestCase.expectedBehavior || ""}
                  onChange={(e) =>
                    setEditingTestCase({
                      ...editingTestCase,
                      expectedBehavior: e.target.value,
                    })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={editingTestCase.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingTestCase({
                      ...editingTestCase,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTestCase(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTestCase}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
