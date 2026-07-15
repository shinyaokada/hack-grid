import type { StageDefinition } from "@/data/stageSchema";
import type { EngineState } from "@/engine/types";

/** All file paths the engine currently knows exist (declared in the stage or produced by a tool run). */
export function getKnownExistingPaths(state: EngineState): string[] {
  return Object.entries(state.files)
    .filter(([, file]) => file.exists)
    .map(([path]) => path)
    .sort();
}

/** Tool names visible in the current directory listing (candidates for `inspect` / `run`). */
export function getVisibleTools(stage: StageDefinition, state: EngineState): string[] {
  const entries = state.filesystem[state.currentDir] ?? [];
  return entries.filter((name) => Object.prototype.hasOwnProperty.call(stage.tools, name));
}

/** Sub-directory names (candidates for `cd`) visible in the current directory listing. */
export function getVisibleDirs(state: EngineState): string[] {
  const entries = state.filesystem[state.currentDir] ?? [];
  return entries.filter((name) => name.endsWith("/")).map((name) => name.slice(0, -1));
}
