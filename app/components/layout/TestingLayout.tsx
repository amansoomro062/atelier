"use client";

import { useState } from "react";
import { SystemPromptTemplate, BatchTestResult } from "@/lib/types";
import { EnhancedSystemPromptLibrary } from "../testing/EnhancedSystemPromptLibrary";
import { BatchTestingPanel } from "../testing/BatchTestingPanel";
import { ComparisonView } from "../testing/ComparisonView";
import { TestHistoryViewer } from "../testing/TestHistoryViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TestingLayout() {
  const [selectedPrompts, setSelectedPrompts] = useState<
    SystemPromptTemplate[]
  >([]);
  const [testResults, setTestResults] = useState<BatchTestResult[]>([]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Panel: Library + History */}
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <Tabs defaultValue="library" className="flex h-full flex-col">
          <div className="border-b px-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="library" className="flex-1 m-0">
            <EnhancedSystemPromptLibrary
              onSelectPrompts={setSelectedPrompts}
              selectedPrompts={new Set(selectedPrompts.map((p) => p.id))}
            />
          </TabsContent>
          <TabsContent value="history" className="flex-1 m-0">
            <TestHistoryViewer onLoadResults={setTestResults} />
          </TabsContent>
        </Tabs>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Batch Testing Panel */}
      <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
        <BatchTestingPanel
          selectedPrompts={selectedPrompts}
          onResultsReady={setTestResults}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Comparison View Panel */}
      <ResizablePanel defaultSize={45} minSize={30}>
        <ComparisonView results={testResults} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
