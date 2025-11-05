"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface PreviewPanelProps {
  response?: string;
  logs?: string[];
}

export function PreviewPanel({ response = "", logs = [] }: PreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Output</h2>
          {response && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="response" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="response">AI Response</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="response" className="flex-1 m-0 p-4">
          <ScrollArea className="h-full">
            {response ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                  {response}
                </pre>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Run a prompt to see AI response here
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 m-0 p-4">
          <Card className="h-full bg-white dark:bg-zinc-950">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Preview will appear here
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="console" className="flex-1 m-0 p-4">
          <ScrollArea className="h-full">
            {logs.length > 0 ? (
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Console output will appear here
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
