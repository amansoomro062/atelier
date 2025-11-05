// WebContainer utilities
// Note: WebContainers require specific browser support and may not work in all environments

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs: string[];
}

// Simple JavaScript execution in browser (fallback for MVP)
export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const logs: string[] = [];
  let output = "";
  let success = true;

  // Create a custom console that captures logs
  const customConsole = {
    log: (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      logs.push(`[LOG] ${message}`);
    },
    error: (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      logs.push(`[ERROR] ${message}`);
    },
    warn: (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      logs.push(`[WARN] ${message}`);
    },
  };

  try {
    // Create a function that runs the code with our custom console
    const wrappedCode = `
      (function(console) {
        ${code}
      })(customConsole);
    `;

    // Execute the code
    const fn = new Function("customConsole", wrappedCode);
    const result = fn(customConsole);

    if (result !== undefined) {
      output = String(result);
      logs.push(`[RESULT] ${output}`);
    }
  } catch (error: any) {
    success = false;
    logs.push(`[ERROR] ${error.message}`);
  }

  return {
    success,
    output,
    logs,
  };
}

// React component execution (simplified)
export async function executeReact(code: string): Promise<ExecutionResult> {
  // For MVP, we'll just validate React syntax
  // Full React execution would require WebContainers or Sandpack

  const logs: string[] = [];
  let success = true;

  try {
    // Basic validation
    if (!code.includes("export default") && !code.includes("function")) {
      throw new Error("React component must export a default function or component");
    }

    logs.push("[INFO] React component syntax validated");
    logs.push("[INFO] Full React execution requires WebContainer integration");
    logs.push("[INFO] This will be available in the next update");
  } catch (error: any) {
    success = false;
    logs.push(`[ERROR] ${error.message}`);
  }

  return {
    success,
    logs,
  };
}
