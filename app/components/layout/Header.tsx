"use client";

import { Sparkles, RotateCcw } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ApiKeyDialog } from "../settings/ApiKeyDialog";
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

interface HeaderProps {
  provider?: "openai" | "anthropic";
  model?: string;
  isConversational?: boolean;
  hasHistory?: boolean;
  isRunning?: boolean;
  onProviderChange?: (provider: "openai" | "anthropic") => void;
  onModelChange?: (model: string) => void;
  onConversationalChange?: (enabled: boolean) => void;
  onResetConversation?: () => void;
  models?: Array<{ id: string; name: string }>;
}

export function Header({
  provider,
  model,
  isConversational,
  hasHistory,
  isRunning,
  onProviderChange,
  onModelChange,
  onConversationalChange,
  onResetConversation,
  models,
}: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6 bg-background">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Atelier</h1>
          <span className="text-xs text-muted-foreground">
            AI Prompt Engineering Playground
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {provider && model && models && onProviderChange && onModelChange && (
          <>
            <Select value={provider} onValueChange={onProviderChange} disabled={isRunning}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={model} onValueChange={onModelChange} disabled={isRunning}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </>
        )}

        <div className="h-6 w-px bg-border" />
        <ApiKeyDialog />
        <ThemeToggle />
      </div>
    </header>
  );
}
