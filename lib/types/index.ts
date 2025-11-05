export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
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
