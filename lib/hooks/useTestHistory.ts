"use client";

import { useState, useEffect } from "react";
import { TestRun } from "@/lib/types";

const STORAGE_KEY = "atelier_test_history";
const MAX_HISTORY = 50; // Keep last 50 test runs

export function useTestHistory() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTestRuns(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse test history:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const saveTestRuns = (newTestRuns: TestRun[]) => {
    // Keep only the most recent runs
    const limited = newTestRuns.slice(0, MAX_HISTORY);
    setTestRuns(limited);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  };

  const addTestRun = (testRun: Omit<TestRun, "id" | "timestamp">) => {
    const newRun: TestRun = {
      ...testRun,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    saveTestRuns([newRun, ...testRuns]);
    return newRun;
  };

  const deleteTestRun = (id: string) => {
    saveTestRuns(testRuns.filter((run) => run.id !== id));
  };

  const clearHistory = () => {
    saveTestRuns([]);
  };

  const getTestRunById = (id: string) => {
    return testRuns.find((run) => run.id === id);
  };

  return {
    testRuns,
    isLoading,
    addTestRun,
    deleteTestRun,
    clearHistory,
    getTestRunById,
  };
}
