"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Plus, X, Loader2 } from "lucide-react";
import { executeJavaScript, executeReact } from "@/lib/utils/webcontainer";
import { toast } from "sonner";

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface CodeEditorProps {
  onExecutionResult?: (logs: string[]) => void;
}

export function CodeEditor({ onExecutionResult }: CodeEditorProps) {
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
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Code Editor</h2>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeFileId} onValueChange={setActiveFileId} className="flex-1 flex flex-col">
          <div className="border-b px-2 py-1">
            <TabsList className="h-auto p-0 bg-transparent">
              {files.map((file) => (
                <TabsTrigger
                  key={file.id}
                  value={file.id}
                  className="relative px-4 py-2 data-[state=active]:bg-muted"
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
            <TabsContent key={file.id} value={file.id} className="flex-1 m-0 overflow-hidden">
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
      </div>
    </div>
  );
}
