"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Settings, Loader2, ImagePlus, X, RotateCcw } from "lucide-react";
import { useApiKeys } from "@/lib/hooks/useApiKeys";
import { getModelsForProvider, DEFAULT_MODELS } from "@/lib/config/models";
import { Message } from "@/lib/types";
import { toast } from "sonner";

interface PromptEditorProps {
  onResponse?: (response: string) => void;
}

export function PromptEditor({ onResponse }: PromptEditorProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("anthropic");
  const [model, setModel] = useState(DEFAULT_MODELS.anthropic);
  const [isRunning, setIsRunning] = useState(false);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [isConversational, setIsConversational] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; completion: number; total: number } | null>(null);
  const [cumulativeTokens, setCumulativeTokens] = useState({ prompt: 0, completion: 0, total: 0 });
  const { getApiKey } = useApiKeys();

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

  const handleResetConversation = () => {
    setConversationHistory([]);
    setCumulativeTokens({ prompt: 0, completion: 0, total: 0 });
    setTokenUsage(null);
    setUserPrompt("");
    setImages([]);
    toast.success("Conversation reset");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Prompt Editor</h2>
          <div className="flex items-center gap-2">
            {isConversational && conversationHistory.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleResetConversation} disabled={isRunning}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Provider</label>
            <Select
              value={provider}
              onValueChange={(v: "openai" | "anthropic") => {
                setProvider(v);
                setModel(DEFAULT_MODELS[v]);
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
                {getModelsForProvider(provider).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="conversational-mode" className="text-sm font-medium">
              Conversational Mode
            </Label>
            <Switch
              id="conversational-mode"
              checked={isConversational}
              onCheckedChange={setIsConversational}
              disabled={isRunning}
            />
          </div>

          {tokenUsage && (
            <div className="text-xs text-muted-foreground space-y-1 py-2 border-t">
              <div className="font-medium">Last Response:</div>
              <div className="flex justify-between">
                <span>Prompt tokens:</span>
                <span>{tokenUsage.prompt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion tokens:</span>
                <span>{tokenUsage.completion.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{tokenUsage.total.toLocaleString()}</span>
              </div>
              {isConversational && cumulativeTokens.total > 0 && (
                <>
                  <div className="font-medium mt-2">Session Total:</div>
                  <div className="flex justify-between font-semibold">
                    <span>All tokens:</span>
                    <span>{cumulativeTokens.total.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          )}
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

          <TabsContent value="user" className="flex-1 mt-0 space-y-3">
            <Textarea
              placeholder="Enter your user prompt here..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="h-full min-h-[200px] resize-none font-mono text-sm"
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
