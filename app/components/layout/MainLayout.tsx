"use client";

import { useState } from "react";
import { Header } from "./Header";
import { PromptEditor } from "../editor/PromptEditor";
import { CodeEditor } from "../editor/CodeEditor";
import { PreviewPanel } from "../preview/PreviewPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/sonner";
import { getModelsForProvider, DEFAULT_MODELS } from "@/lib/config/models";

export function MainLayout() {
  const [aiResponse, setAiResponse] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [provider, setProvider] = useState<"openai" | "anthropic">("anthropic");
  const [model, setModel] = useState(DEFAULT_MODELS.anthropic);
  const [isConversational, setIsConversational] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleProviderChange = (newProvider: "openai" | "anthropic") => {
    setProvider(newProvider);
    setModel(DEFAULT_MODELS[newProvider]);
  };

  const handleResetConversation = () => {
    setConversationHistory([]);
    // Note: cumulative tokens are reset in PromptEditor component
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        provider={provider}
        model={model}
        isConversational={isConversational}
        hasHistory={conversationHistory.length > 0}
        isRunning={isRunning}
        onProviderChange={handleProviderChange}
        onModelChange={setModel}
        onConversationalChange={setIsConversational}
        onResetConversation={handleResetConversation}
        models={getModelsForProvider(provider)}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Prompt Editor Panel */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <PromptEditor
            onResponse={setAiResponse}
            provider={provider}
            model={model}
            isConversational={isConversational}
            onConversationalChange={setIsConversational}
            conversationHistory={conversationHistory}
            onConversationHistoryChange={setConversationHistory}
            onResetConversation={handleResetConversation}
            isRunning={isRunning}
            onRunningChange={setIsRunning}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Code Editor Panel */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <CodeEditor
            onExecutionResult={setConsoleLogs}
            conversationHistory={conversationHistory}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <PreviewPanel response={aiResponse} logs={consoleLogs} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <Toaster />
    </div>
  );
}
