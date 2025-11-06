/**
 * Latest AI Model Configurations
 * Updated: 2025-01
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: "openai" | "anthropic";
  description?: string;
  contextWindow?: number;
  maxOutput?: number;
}

/**
 * OpenAI Models
 * https://platform.openai.com/docs/models
 */
export const OPENAI_MODELS: ModelConfig[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Latest multimodal flagship model, faster and cheaper than GPT-4 Turbo",
    contextWindow: 128000,
    maxOutput: 16384,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Affordable and intelligent small model for fast, lightweight tasks",
    contextWindow: 128000,
    maxOutput: 16384,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "Previous generation high-intelligence model",
    contextWindow: 128000,
    maxOutput: 4096,
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    description: "Original GPT-4 model (legacy)",
    contextWindow: 8192,
    maxOutput: 8192,
  },
];

/**
 * Anthropic Claude Models
 * https://docs.anthropic.com/en/docs/about-claude/models
 */
export const ANTHROPIC_MODELS: ModelConfig[] = [
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Most capable model with advanced reasoning and analysis",
    contextWindow: 200000,
    maxOutput: 8192,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Previous generation intelligent model, best for complex tasks",
    contextWindow: 200000,
    maxOutput: 8192,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    description: "Fastest and most compact model, great for speed",
    contextWindow: 200000,
    maxOutput: 8192,
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    description: "Previous generation most capable model",
    contextWindow: 200000,
    maxOutput: 4096,
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku (Legacy)",
    provider: "anthropic",
    description: "Previous generation fast model",
    contextWindow: 200000,
    maxOutput: 4096,
  },
];

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
} as const;

/**
 * Get all models for a provider
 */
export function getModelsForProvider(
  provider: "openai" | "anthropic"
): ModelConfig[] {
  return provider === "openai" ? OPENAI_MODELS : ANTHROPIC_MODELS;
}

/**
 * Get model info by ID
 */
export function getModelById(modelId: string): ModelConfig | undefined {
  return [...OPENAI_MODELS, ...ANTHROPIC_MODELS].find((m) => m.id === modelId);
}

/**
 * Get recommended models (latest from each provider)
 */
export const RECOMMENDED_MODELS = {
  openai: OPENAI_MODELS[0], // GPT-4o
  anthropic: ANTHROPIC_MODELS[0], // Claude Sonnet 4.5
};
