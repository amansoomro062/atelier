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
    let loadedKeys: ApiKeys = {};

    if (stored) {
      try {
        loadedKeys = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse stored API keys:", error);
      }
    }

    // Use environment variables as defaults if not in localStorage
    const envKeys: ApiKeys = {
      openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      anthropic: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    };

    // Merge: localStorage takes precedence, env vars as fallback
    const finalKeys: ApiKeys = {
      openai: loadedKeys.openai || envKeys.openai,
      anthropic: loadedKeys.anthropic || envKeys.anthropic,
    };

    setKeys(finalKeys);
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
