"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Eye, EyeOff } from "lucide-react";
import { useApiKeys } from "@/lib/hooks/useApiKeys";

export function ApiKeyDialog() {
  const { keys, setApiKey, clearApiKey } = useApiKeys();
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (openaiKey) setApiKey("openai", openaiKey);
    if (anthropicKey) setApiKey("anthropic", anthropicKey);
    setOpen(false);
  };

  const handleRemove = (provider: "openai" | "anthropic") => {
    if (confirm(`Are you sure you want to remove your ${provider === "openai" ? "OpenAI" : "Anthropic"} API key?`)) {
      clearApiKey(provider);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="mr-2 h-4 w-4" />
          API Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure API Keys</DialogTitle>
          <DialogDescription>
            Add your API keys to start using Atelier. Keys are stored locally in your
            browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="openai" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
          </TabsList>

          <TabsContent value="openai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenai ? "text" : "password"}
                  placeholder={keys.openai ? "••••••••••••••••" : "sk-..."}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowOpenai(!showOpenai)}
                >
                  {showOpenai ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
            {keys.openai && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ API key configured
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove("openai")}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="anthropic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              <div className="relative">
                <Input
                  id="anthropic-key"
                  type={showAnthropic ? "text" : "password"}
                  placeholder={keys.anthropic ? "••••••••••••••••" : "sk-ant-..."}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                >
                  {showAnthropic ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Anthropic Console
                </a>
              </p>
            </div>
            {keys.anthropic && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ API key configured
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove("anthropic")}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleSave}>Save Keys</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
