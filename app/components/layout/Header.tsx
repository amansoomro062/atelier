"use client";

import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ApiKeyDialog } from "../settings/ApiKeyDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  currentView?: "editor" | "testing";
  onViewChange?: (view: "editor" | "testing") => void;
}

export function Header({ currentView = "editor", onViewChange }: HeaderProps) {
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

        {onViewChange && (
          <Tabs value={currentView} onValueChange={(v) => onViewChange(v as "editor" | "testing")}>
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ApiKeyDialog />
        <ThemeToggle />
      </div>
    </header>
  );
}
