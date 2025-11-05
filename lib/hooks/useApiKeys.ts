"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "atelier_api_keys";

interface ApiKeys {
  openai?: string;
  anthropic?: string;
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load keys from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setKeys(parsed);
      } catch (error) {
        console.error("Failed to parse stored API keys:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  const setApiKey = (provider: "openai" | "anthropic", key: string) => {
    const newKeys = { ...keys, [provider]: key };
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const getApiKey = (provider: "openai" | "anthropic"): string | undefined => {
    return keys[provider];
  };

  const clearApiKey = (provider: "openai" | "anthropic") => {
    const newKeys = { ...keys };
    delete newKeys[provider];
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const clearAllKeys = () => {
    setKeys({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    keys,
    isLoaded,
    setApiKey,
    getApiKey,
    clearApiKey,
    clearAllKeys,
  };
}
