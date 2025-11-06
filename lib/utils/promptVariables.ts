import { PromptVariable } from "@/lib/types";

/**
 * Replace variables in a prompt with their values
 * Variables should be in the format {{variableName}}
 */
export function replacePromptVariables(
  prompt: string,
  variables: PromptVariable[]
): string {
  let result = prompt;

  variables.forEach((variable) => {
    const pattern = new RegExp(`\\{\\{${variable.key}\\}\\}`, "g");
    result = result.replace(pattern, variable.value);
  });

  return result;
}

/**
 * Extract variable keys from a prompt
 * Returns array of unique variable names found in {{variableName}} format
 */
export function extractVariableKeys(prompt: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const keys = new Set<string>();
  let match;

  while ((match = regex.exec(prompt)) !== null) {
    keys.add(match[1].trim());
  }

  return Array.from(keys);
}

/**
 * Validate that all variables in a prompt have values
 */
export function validatePromptVariables(
  prompt: string,
  variables: PromptVariable[]
): {
  valid: boolean;
  missingVariables: string[];
} {
  const requiredKeys = extractVariableKeys(prompt);
  const providedKeys = new Set(variables.map((v) => v.key));

  const missingVariables = requiredKeys.filter((key) => !providedKeys.has(key));

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Generate test variations by replacing variables with different values
 */
export function generateTestVariations(
  basePrompt: string,
  variableSets: Record<string, string[]>
): Array<{ prompt: string; variables: PromptVariable[] }> {
  const variations: Array<{ prompt: string; variables: PromptVariable[] }> = [];

  // Get all variable keys
  const keys = Object.keys(variableSets);
  if (keys.length === 0) {
    return [{ prompt: basePrompt, variables: [] }];
  }

  // Generate all combinations
  function generateCombinations(
    index: number,
    currentVariables: PromptVariable[]
  ) {
    if (index === keys.length) {
      const prompt = replacePromptVariables(basePrompt, currentVariables);
      variations.push({
        prompt,
        variables: [...currentVariables],
      });
      return;
    }

    const key = keys[index];
    const values = variableSets[key];

    values.forEach((value) => {
      generateCombinations(index + 1, [
        ...currentVariables,
        { key, value },
      ]);
    });
  }

  generateCombinations(0, []);
  return variations;
}

/**
 * Common variable templates for quick use
 */
export const commonVariableTemplates = {
  tone: {
    key: "tone",
    description: "The tone of the response",
    values: ["professional", "casual", "friendly", "formal", "enthusiastic"],
  },
  role: {
    key: "role",
    description: "The role of the AI assistant",
    values: [
      "software engineer",
      "teacher",
      "consultant",
      "analyst",
      "writer",
    ],
  },
  outputFormat: {
    key: "output_format",
    description: "The format of the output",
    values: ["markdown", "JSON", "plain text", "bullet points", "numbered list"],
  },
  detailLevel: {
    key: "detail_level",
    description: "Level of detail in the response",
    values: ["brief", "moderate", "detailed", "comprehensive"],
  },
};
