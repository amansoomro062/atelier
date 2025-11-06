"use client";

import { useState, useEffect } from "react";
import { TestCase } from "@/lib/types";

const STORAGE_KEY = "atelier_test_cases";

export function useTestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTestCases(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored test cases:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const saveTestCases = (newTestCases: TestCase[]) => {
    setTestCases(newTestCases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTestCases));
  };

  const addTestCase = (testCase: Omit<TestCase, "id">) => {
    const newTestCase: TestCase = {
      ...testCase,
      id: crypto.randomUUID(),
    };
    saveTestCases([...testCases, newTestCase]);
    return newTestCase;
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    const updatedTestCases = testCases.map((tc) =>
      tc.id === id ? { ...tc, ...updates } : tc
    );
    saveTestCases(updatedTestCases);
  };

  const deleteTestCase = (id: string) => {
    saveTestCases(testCases.filter((tc) => tc.id !== id));
  };

  return {
    testCases,
    isLoading,
    addTestCase,
    updateTestCase,
    deleteTestCase,
  };
}
