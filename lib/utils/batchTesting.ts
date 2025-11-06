import {
  SystemPromptTemplate,
  TestCase,
  BatchTestResult,
  EvaluationMetrics,
} from "@/lib/types";
import {
  calculateQualityScore,
  calculateRelevanceScore,
  calculateCoherenceScore,
} from "./qualityScoring";

interface BatchTestOptions {
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
  evaluateQuality?: boolean;
  onProgress?: (progress: number, total: number) => void;
}

export async function runBatchTest(
  prompts: SystemPromptTemplate[],
  testCases: TestCase[],
  options: BatchTestOptions
): Promise<BatchTestResult[]> {
  const results: BatchTestResult[] = [];
  const total = prompts.length * testCases.length;
  let completed = 0;

  for (const prompt of prompts) {
    for (const testCase of testCases) {
      const startTime = Date.now();

      try {
        const response = await executePrompt(
          prompt.content,
          testCase.userPrompt,
          options.provider,
          options.model,
          options.apiKey
        );

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Calculate quality metrics if enabled
        let metrics: EvaluationMetrics = {
          responseTime,
          tokens: response.tokens,
          cost: response.cost,
        };

        if (options.evaluateQuality) {
          const result: BatchTestResult = {
            id: crypto.randomUUID(),
            promptTemplateId: prompt.id,
            promptTemplateName: prompt.name,
            testCaseId: testCase.id,
            testCaseName: testCase.name,
            provider: options.provider,
            model: options.model,
            response: response.content,
            metrics,
            timestamp: new Date().toISOString(),
          };

          metrics.qualityScore = calculateQualityScore(result);
          metrics.relevanceScore = calculateRelevanceScore(
            response.content,
            testCase.expectedBehavior
          );
          metrics.coherenceScore = calculateCoherenceScore(response.content);
        }

        const result: BatchTestResult = {
          id: crypto.randomUUID(),
          promptTemplateId: prompt.id,
          promptTemplateName: prompt.name,
          testCaseId: testCase.id,
          testCaseName: testCase.name,
          provider: options.provider,
          model: options.model,
          response: response.content,
          metrics,
          timestamp: new Date().toISOString(),
        };

        results.push(result);
      } catch (error) {
        console.error(`Error testing ${prompt.name} with ${testCase.name}:`, error);
      }

      completed++;
      options.onProgress?.(completed, total);
    }
  }

  return results;
}

interface PromptResponse {
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
}

async function executePrompt(
  systemPrompt: string,
  userPrompt: string,
  provider: "openai" | "anthropic",
  model: string,
  apiKey: string
): Promise<PromptResponse> {
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
    throw new Error(`API request failed: ${response.statusText}`);
  }

  // Handle streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

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
            fullContent += parsed.content;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  return {
    content: fullContent,
    // Note: Token counting would need to be implemented based on provider response
    // For now, we'll estimate or leave undefined
  };
}

export function calculateMetrics(
  results: BatchTestResult[]
): Record<string, any> {
  if (results.length === 0) return {};

  const totalTime = results.reduce((sum, r) => sum + r.metrics.responseTime, 0);
  const avgTime = totalTime / results.length;

  const totalTokens = results.reduce(
    (sum, r) => sum + (r.metrics.tokens?.total || 0),
    0
  );
  const avgTokens = totalTokens / results.length;

  return {
    totalTests: results.length,
    avgResponseTime: Math.round(avgTime),
    totalResponseTime: totalTime,
    avgTokens: Math.round(avgTokens),
    totalTokens,
  };
}

export function compareResults(
  results: BatchTestResult[],
  testCaseId: string
): BatchTestResult[] {
  return results.filter((r) => r.testCaseId === testCaseId);
}
