import { BatchTestResult } from "@/lib/types";

/**
 * Calculate a quality score for a response based on various factors
 * This is a simple heuristic-based approach. For production, you'd want to use
 * an AI model to evaluate quality.
 */
export function calculateQualityScore(result: BatchTestResult): number {
  let score = 50; // Start at 50/100

  // Length check (responses should be substantive but not too verbose)
  const responseLength = result.response.length;
  if (responseLength > 100 && responseLength < 2000) {
    score += 20;
  } else if (responseLength >= 2000 && responseLength < 5000) {
    score += 10;
  } else if (responseLength < 50) {
    score -= 20; // Too short
  } else if (responseLength > 10000) {
    score -= 10; // Too verbose
  }

  // Response time check (faster is better, but not suspiciously fast)
  const responseTime = result.metrics.responseTime;
  if (responseTime > 1000 && responseTime < 10000) {
    score += 15; // Good balance
  } else if (responseTime < 500) {
    score -= 10; // Suspiciously fast
  } else if (responseTime > 30000) {
    score -= 15; // Too slow
  }

  // Structure check (look for markdown, code blocks, lists)
  const hasMarkdownFormatting =
    /```|###|##|#|\*\*|\*|-\s|\d+\./g.test(result.response);
  if (hasMarkdownFormatting) {
    score += 10;
  }

  // Completeness check (doesn't end abruptly)
  const endsAbruptly =
    result.response.endsWith("...") ||
    result.response.trim().length < 50;
  if (!endsAbruptly) {
    score += 5;
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate relevance score based on keyword matching
 * This is a simple approach - in production, use semantic similarity
 */
export function calculateRelevanceScore(
  response: string,
  expectedBehavior?: string
): number {
  if (!expectedBehavior) return 0;

  const responseWords = new Set(
    response.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );
  const expectedWords = expectedBehavior
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  if (expectedWords.length === 0) return 0;

  const matches = expectedWords.filter((word) => responseWords.has(word)).length;
  return Math.round((matches / expectedWords.length) * 100);
}

/**
 * Calculate coherence score based on sentence structure
 */
export function calculateCoherenceScore(response: string): number {
  let score = 50;

  // Check for proper sentence structure
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength =
    sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

  // Good sentence length range
  if (avgSentenceLength > 20 && avgSentenceLength < 150) {
    score += 20;
  }

  // Check for repetition
  const words = response.toLowerCase().split(/\W+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = uniqueWords.size / words.length;
  if (repetitionRatio > 0.5) {
    score += 15; // Good vocabulary variety
  } else if (repetitionRatio < 0.3) {
    score -= 15; // Too repetitive
  }

  // Check for proper capitalization
  const hasProperCapitalization = /^[A-Z]/.test(response);
  if (hasProperCapitalization) {
    score += 10;
  }

  // Check for logical flow (presence of connectors)
  const connectors = [
    "however",
    "therefore",
    "additionally",
    "furthermore",
    "moreover",
    "consequently",
    "thus",
    "hence",
  ];
  const hasConnectors = connectors.some((c) =>
    response.toLowerCase().includes(c)
  );
  if (hasConnectors) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Enhanced quality evaluation with AI (optional)
 * This would make an API call to evaluate quality using another AI model
 */
export async function evaluateQualityWithAI(
  result: BatchTestResult,
  apiKey: string,
  provider: "openai" | "anthropic" = "openai"
): Promise<{
  qualityScore: number;
  feedback: string;
}> {
  // This is a placeholder for AI-powered evaluation
  // In production, you'd make an API call to evaluate the response quality

  const prompt = `Evaluate the quality of this AI response on a scale of 0-100 based on:
- Accuracy and correctness
- Clarity and coherence
- Completeness
- Usefulness

Response to evaluate:
"""
${result.response}
"""

Provide a score (0-100) and brief feedback.`;

  // For now, return heuristic-based scores
  const qualityScore = calculateQualityScore(result);
  const coherenceScore = calculateCoherenceScore(result.response);

  return {
    qualityScore: Math.round((qualityScore + coherenceScore) / 2),
    feedback: `Automated evaluation based on length, structure, and coherence.`,
  };
}
