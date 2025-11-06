"use client";

import { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Plus, X, Loader2 } from "lucide-react";
import { executeJavaScript, executeReact } from "@/lib/utils/webcontainer";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

interface CodeEditorProps {
  onExecutionResult?: (logs: string[]) => void;
  conversationHistory?: Message[];
}

export function CodeEditor({ onExecutionResult, conversationHistory = [] }: CodeEditorProps) {
  const [mainTab, setMainTab] = useState("editor");
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: "1",
      name: "index.js",
      language: "javascript",
      content: "// Write your code here\nconsole.log('Hello from Atelier!');\n\n// Try some code\nconst add = (a, b) => a + b;\nconsole.log('2 + 3 =', add(2, 3));",
    },
  ]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [isRunning, setIsRunning] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  // Calculate token stats
  const tokenStats = useMemo(() => {
    const stats = {
      totalPrompt: 0,
      totalCompletion: 0,
      totalTokens: 0,
      messageCount: conversationHistory.length,
    };

    conversationHistory.forEach((msg) => {
      if (msg.tokens) {
        stats.totalPrompt += msg.tokens.prompt;
        stats.totalCompletion += msg.tokens.completion;
        stats.totalTokens += msg.tokens.total;
      }
    });

    return stats;
  }, [conversationHistory]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !activeFile) return;
    setFiles(files.map((f) => (f.id === activeFileId ? { ...f, content: value } : f)));
  };

  const handleRun = async () => {
    if (!activeFile) return;

    setIsRunning(true);

    try {
      let result;

      if (activeFile.language === "javascript" || activeFile.language === "typescript") {
        result = await executeJavaScript(activeFile.content);
      } else if (activeFile.language === "jsx" || activeFile.language === "tsx") {
        result = await executeReact(activeFile.content);
      } else {
        toast.error(`Execution for ${activeFile.language} not yet supported`);
        return;
      }

      onExecutionResult?.(result.logs);

      if (result.success) {
        toast.success("Code executed successfully");
      } else {
        toast.error("Code execution failed");
      }
    } catch (error: any) {
      console.error("Execution error:", error);
      toast.error(error.message || "Failed to execute code");
      onExecutionResult?.([`[ERROR] ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-r">
      <div className="border-b p-4 h-[57px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-semibold">Code Editor</h2>
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            {mainTab === "editor" && (
              <Button size="sm" variant="outline" onClick={handleRun} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-3 w-3" />
                    Run Code
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="mx-4 mt-2">
          <TabsList className="w-full grid grid-cols-3 bg-muted/30">
          <TabsTrigger
            value="editor"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            History ({conversationHistory.length})
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            Stats
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Editor Tab */}
        <TabsContent value="editor" className="flex-1 mt-4 data-[state=active]:flex data-[state=inactive]:hidden flex-col overflow-hidden">
          <Tabs value={activeFileId} onValueChange={setActiveFileId} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b px-2 py-1">
              <TabsList className="h-auto p-0 bg-muted/30">
                {files.map((file) => (
                  <TabsTrigger
                    key={file.id}
                    value={file.id}
                    className="relative px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    {file.name}
                  </TabsTrigger>
                ))}
                <Button size="icon" variant="ghost" className="h-8 w-8 ml-2" disabled>
                  <Plus className="h-4 w-4" />
                </Button>
              </TabsList>
            </div>

            {files.map((file) => (
              <TabsContent key={file.id} value={file.id} className="flex-1 m-0 overflow-hidden data-[state=active]:flex">
                <Editor
                  height="100%"
                  defaultLanguage={file.language}
                  value={file.content}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 mt-4 data-[state=active]:flex data-[state=inactive]:hidden flex-col overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-4">
              {conversationHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No conversation history yet. Enable conversational mode and run a prompt to start.
                </div>
              ) : (
                conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary/10 border-l-4 border-primary"
                        : message.role === "assistant"
                        ? "bg-secondary border-l-4 border-accent"
                        : "bg-muted/50 border-l-4 border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold capitalize">{message.role}</span>
                      {message.tokens && (
                        <span className="text-xs text-muted-foreground">
                          {message.tokens.total.toLocaleString()} tokens
                        </span>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    {message.tokens && (
                      <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                        <span>Prompt: {message.tokens.prompt.toLocaleString()}</span>
                        <span>Completion: {message.tokens.completion.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="flex-1 mt-4 data-[state=active]:flex data-[state=inactive]:hidden flex-col overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Session Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">Total Messages</div>
                    <div className="text-2xl font-bold">{tokenStats.messageCount}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Total Tokens</div>
                    <div className="text-2xl font-bold">{tokenStats.totalTokens.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/50 border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Prompt Tokens</div>
                    <div className="text-2xl font-bold">{tokenStats.totalPrompt.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/50 border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Completion Tokens</div>
                    <div className="text-2xl font-bold">
                      {tokenStats.totalCompletion.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {conversationHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Average per Message</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted border border-border">
                      <div className="text-sm text-muted-foreground mb-1">Avg Prompt</div>
                      <div className="text-xl font-semibold">
                        {Math.round(tokenStats.totalPrompt / tokenStats.messageCount).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted border border-border">
                      <div className="text-sm text-muted-foreground mb-1">Avg Completion</div>
                      <div className="text-xl font-semibold">
                        {Math.round(
                          tokenStats.totalCompletion / tokenStats.messageCount
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
