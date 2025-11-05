"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Settings, Loader2 } from "lucide-react";
import { useApiKeys } from "@/lib/hooks/useApiKeys";
import { toast } from "sonner";

interface PromptEditorProps {
  onResponse?: (response: string) => void;
}

export function PromptEditor({ onResponse }: PromptEditorProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [model, setModel] = useState("gpt-4");
  const [isRunning, setIsRunning] = useState(false);
  const { getApiKey } = useApiKeys();

  const handleRun = async () => {
    const apiKey = getApiKey(provider);

    if (!apiKey) {
      toast.error(`Please set your ${provider === "openai" ? "OpenAI" : "Anthropic"} API key first`);
      return;
    }

    if (!userPrompt.trim()) {
      toast.error("Please enter a user prompt");
      return;
    }

    setIsRunning(true);
    let fullResponse = "";

    try {
      const endpoint = provider === "openai" ? "/api/openai" : "/api/anthropic";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          model,
          apiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                onResponse?.(fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      toast.success("Response generated successfully");
    } catch (error: any) {
      console.error("Error running prompt:", error);
      toast.error(error.message || "Failed to generate response");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Prompt Editor</h2>
          <Button size="icon" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Provider</label>
            <Select
              value={provider}
              onValueChange={(v: "openai" | "anthropic") => {
                setProvider(v);
                setModel(v === "openai" ? "gpt-4" : "claude-3-5-sonnet-20241022");
              }}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Model</label>
            <Select value={model} onValueChange={setModel} disabled={isRunning}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provider === "openai" ? (
                  <>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="system" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="system" disabled={isRunning}>System Prompt</TabsTrigger>
            <TabsTrigger value="user" disabled={isRunning}>User Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="flex-1 mt-0">
            <Textarea
              placeholder="Enter your system prompt here..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="h-full min-h-[300px] resize-none font-mono text-sm"
              disabled={isRunning}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {systemPrompt.length} characters
            </div>
          </TabsContent>

          <TabsContent value="user" className="flex-1 mt-0">
            <Textarea
              placeholder="Enter your user prompt here..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="h-full min-h-[300px] resize-none font-mono text-sm"
              disabled={isRunning}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {userPrompt.length} characters
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t p-4">
        <Button onClick={handleRun} className="w-full" size="lg" disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Prompt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
