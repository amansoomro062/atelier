"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Loader2, ImagePlus, X, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { useApiKeys } from "@/lib/hooks/useApiKeys";
import { Message } from "@/lib/types";
import { toast } from "sonner";

interface PromptEditorProps {
  onResponse?: (response: string) => void;
  provider: "openai" | "anthropic";
  model: string;
  isConversational: boolean;
  onConversationalChange: (enabled: boolean) => void;
  conversationHistory: Message[];
  onConversationHistoryChange: (history: Message[]) => void;
  onResetConversation: () => void;
  isRunning: boolean;
  onRunningChange: (running: boolean) => void;
}

export function PromptEditor({
  onResponse,
  provider,
  model,
  isConversational,
  onConversationalChange,
  conversationHistory,
  onConversationHistoryChange,
  onResetConversation,
  isRunning,
  onRunningChange,
}: PromptEditorProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; completion: number; total: number } | null>(null);
  const [cumulativeTokens, setCumulativeTokens] = useState({ prompt: 0, completion: 0, total: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { getApiKey } = useApiKeys();

  const setIsRunning = onRunningChange;
  const setConversationHistory = onConversationHistoryChange;

  // Reset cumulative tokens when conversation history is cleared
  useEffect(() => {
    if (conversationHistory.length === 0) {
      setCumulativeTokens({ prompt: 0, completion: 0, total: 0 });
      setTokenUsage(null);
      setUserPrompt("");
      setImages([]);
    }
  }, [conversationHistory.length]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: Array<{ file: File; preview: string }> = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push({
          file,
          preview: event.target?.result as string,
        });

        if (newImages.length === files.length) {
          setImages([...images, ...newImages]);
          toast.success(`Added ${newImages.length} image(s)`);
        }
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

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
    let responseTokens: { prompt: number; completion: number; total: number } | null = null;

    try {
      const endpoint = provider === "openai" ? "/api/openai" : "/api/anthropic";

      // Convert images to base64
      const imageData = images.map((img) => ({
        data: img.preview.split(',')[1], // Remove data:image/...;base64, prefix
        mimeType: img.file.type,
      }));

      // Build conversation history for API (only role and content, no images in history)
      const apiMessages = conversationHistory.map(msg => ({
        role: msg.role === "system" ? "user" : msg.role, // Convert system to user for history
        content: msg.content
      }));

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
          images: imageData.length > 0 ? imageData : undefined,
          messages: isConversational ? apiMessages : undefined,
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
              if (parsed.tokens) {
                responseTokens = parsed.tokens;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Update conversation history if in conversational mode
      if (isConversational) {
        const userMessage: Message = {
          role: "user",
          content: userPrompt,
          images: imageData.length > 0 ? imageData : undefined,
          timestamp: new Date().toISOString(),
        };
        const assistantMessage: Message = {
          role: "assistant",
          content: fullResponse,
          tokens: responseTokens || undefined,
          timestamp: new Date().toISOString(),
        };
        setConversationHistory([...conversationHistory, userMessage, assistantMessage]);
      }

      // Update token usage
      if (responseTokens) {
        setTokenUsage(responseTokens);
        setCumulativeTokens(prev => ({
          prompt: prev.prompt + responseTokens!.prompt,
          completion: prev.completion + responseTokens!.completion,
          total: prev.total + responseTokens!.total,
        }));
      }

      // Clear input and images for next turn in conversational mode
      if (isConversational) {
        setUserPrompt("");
        setImages([]);
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
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      <div className="flex-1 overflow-hidden p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
            <Switch
              id="conversational-mode"
              checked={isConversational}
              onCheckedChange={onConversationalChange}
              disabled={isRunning}
            />
            <Label htmlFor="conversational-mode" className="text-sm cursor-pointer font-medium">
              Conversation
            </Label>
          </div>

          {isConversational && conversationHistory.length > 0 && (
            <Button size="sm" variant="outline" onClick={onResetConversation} disabled={isRunning}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <Tabs defaultValue="system" className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <TabsList className="flex-1 grid grid-cols-2 bg-muted/30">
            <TabsTrigger
              value="system"
              disabled={isRunning}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              System
            </TabsTrigger>
            <TabsTrigger
              value="user"
              disabled={isRunning}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              User
            </TabsTrigger>
          </TabsList>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="shrink-0"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          </div>

          <TabsContent value="system" className="flex-1 mt-0 overflow-hidden flex flex-col">
            <Textarea
              placeholder="Enter your system prompt here..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="flex-1 resize-none font-mono text-sm"
              disabled={isRunning}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {systemPrompt.length} characters
            </div>
          </TabsContent>

          <TabsContent value="user" className="flex-1 mt-0 overflow-hidden flex flex-col gap-3">
            <Textarea
              placeholder="Enter your user prompt here... (Press Enter to run, Shift+Enter for new line)"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isRunning && userPrompt.trim()) {
                    handleRun();
                  }
                }
              }}
              className="flex-1 resize-none font-mono text-sm"
              disabled={isRunning}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {userPrompt.length} characters
              </div>
              <label htmlFor="image-upload">
                <Button variant="outline" size="sm" asChild disabled={isRunning}>
                  <span className="cursor-pointer">
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Add Image{images.length > 0 && `s (${images.length})`}
                  </span>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isRunning}
                />
              </label>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isRunning}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {img.file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              Run Prompt{images.length > 0 && ` with ${images.length} image(s)`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
