export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  images?: Array<{ data: string; mimeType: string }>;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  timestamp?: string;
}

export interface AIProvider {
  name: "openai" | "anthropic";
  apiKey: string;
}

export interface ModelConfig {
  provider: "openai" | "anthropic";
  model: string;
}

export interface PromptRequest {
  systemPrompt: string;
  userPrompt: string;
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
}

export interface PromptResponse {
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  model: string;
}

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs: string[];
}

// System Prompt Testing Types
export interface SystemPromptTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  source?: "file" | "manual" | "github";
  sourceUrl?: string;
}

export interface TestCase {
  id: string;
  name: string;
  userPrompt: string;
  expectedBehavior?: string;
  tags?: string[];
}

export interface BatchTestResult {
  id: string;
  promptTemplateId: string;
  promptTemplateName: string;
  testCaseId: string;
  testCaseName: string;
  provider: "openai" | "anthropic";
  model: string;
  response: string;
  metrics: EvaluationMetrics;
  timestamp: string;
}

export interface EvaluationMetrics {
  responseTime: number; // in milliseconds
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  qualityScore?: number; // 0-100
  relevanceScore?: number; // 0-100
  coherenceScore?: number; // 0-100
  customMetrics?: Record<string, number>;
}

export interface BatchTestConfig {
  promptTemplates: SystemPromptTemplate[];
  testCases: TestCase[];
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
  evaluateQuality?: boolean;
}

export interface ComparisonResult {
  testCase: TestCase;
  results: BatchTestResult[];
}

export interface TestRun {
  id: string;
  name: string;
  description?: string;
  results: BatchTestResult[];
  config: {
    provider: "openai" | "anthropic";
    model: string;
    promptCount: number;
    testCaseCount: number;
  };
  summary: {
    totalTests: number;
    avgResponseTime: number;
    totalTokens: number;
    totalCost: number;
  };
  timestamp: string;
}

export interface PromptVariable {
  key: string;
  value: string;
  description?: string;
}
