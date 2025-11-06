"use client";

import { useState, useEffect } from "react";
import { SystemPromptTemplate } from "@/lib/types";

const STORAGE_KEY = "atelier_prompt_library";

export function usePromptLibrary() {
  const [prompts, setPrompts] = useState<SystemPromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrompts(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored prompts:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const savePrompts = (newPrompts: SystemPromptTemplate[]) => {
    setPrompts(newPrompts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrompts));
  };

  const addPrompt = (
    prompt: Omit<SystemPromptTemplate, "id" | "createdAt" | "updatedAt">
  ) => {
    const newPrompt: SystemPromptTemplate = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePrompts([...prompts, newPrompt]);
    return newPrompt;
  };

  const updatePrompt = (id: string, updates: Partial<SystemPromptTemplate>) => {
    const updatedPrompts = prompts.map((p) =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );
    savePrompts(updatedPrompts);
  };

  const deletePrompt = (id: string) => {
    savePrompts(prompts.filter((p) => p.id !== id));
  };

  const importPromptFromFile = async (file: File): Promise<SystemPromptTemplate> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const prompt = addPrompt({
          name: file.name.replace(/\.(txt|md)$/, ""),
          content,
          source: "file",
          description: `Imported from ${file.name}`,
        });
        resolve(prompt);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const exportPrompt = (prompt: SystemPromptTemplate) => {
    const blob = new Blob([prompt.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    prompts,
    isLoading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    importPromptFromFile,
    exportPrompt,
  };
}
