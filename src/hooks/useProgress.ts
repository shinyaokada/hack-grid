"use client";

import { useEffect, useState } from "react";
import type { CommandName } from "@/data/stageSchema";

const STORAGE_KEY = "hacking-game:progress:v1";

interface StoredProgress {
  clearedStageIds: string[];
  usedCommands: string[];
  hasSeenHomeGuide: boolean;
  hasLaunchedBefore: boolean;
}

const DEFAULT_PROGRESS: StoredProgress = {
  clearedStageIds: [],
  usedCommands: [],
  hasSeenHomeGuide: false,
  hasLaunchedBefore: false,
};

function readStoredProgress(): StoredProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      clearedStageIds: parsed.clearedStageIds ?? [],
      usedCommands: parsed.usedCommands ?? [],
      hasSeenHomeGuide: Boolean(parsed.hasSeenHomeGuide),
      hasLaunchedBefore: Boolean(parsed.hasLaunchedBefore),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

/** Persists ver1 progress (cleared stages, used commands, one-shot guides) to localStorage. */
export function useProgress() {
  // Lazily hydrated from localStorage: on the server (and the very first client
  // render before hydration) this falls back to defaults, which is safe here
  // because no screen reads progress until after the title screen's first paint.
  const [progress, setProgress] = useState<StoredProgress>(readStoredProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // storage unavailable (private mode, quota, etc.): progress just won't persist
    }
  }, [progress]);

  const clearedIds = new Set(progress.clearedStageIds);
  const usedCommands = new Set(progress.usedCommands as CommandName[]);

  return {
    clearedIds,
    usedCommands,
    hasSeenHomeGuide: progress.hasSeenHomeGuide,
    hasLaunchedBefore: progress.hasLaunchedBefore,
    markCleared: (id: string) =>
      setProgress((prev) =>
        prev.clearedStageIds.includes(id)
          ? prev
          : { ...prev, clearedStageIds: [...prev.clearedStageIds, id] },
      ),
    markCommandUsed: (name: CommandName) =>
      setProgress((prev) =>
        prev.usedCommands.includes(name)
          ? prev
          : { ...prev, usedCommands: [...prev.usedCommands, name] },
      ),
    markHomeGuideSeen: () => setProgress((prev) => ({ ...prev, hasSeenHomeGuide: true })),
    markLaunched: () => setProgress((prev) => ({ ...prev, hasLaunchedBefore: true })),
  };
}
