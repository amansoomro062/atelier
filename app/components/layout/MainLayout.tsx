"use client";

import { useState } from "react";
import { Header } from "./Header";
import { PromptEditor } from "../editor/PromptEditor";
import { CodeEditor } from "../editor/CodeEditor";
import { PreviewPanel } from "../preview/PreviewPanel";
import { TestingLayout } from "./TestingLayout";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/sonner";

export function MainLayout() {
  const [aiResponse, setAiResponse] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"editor" | "testing">("editor");

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      {currentView === "editor" ? (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Prompt Editor Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <PromptEditor onResponse={setAiResponse} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <CodeEditor onExecutionResult={setConsoleLogs} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <PreviewPanel response={aiResponse} logs={consoleLogs} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <TestingLayout />
      )}

      <Toaster />
    </div>
  );
}
