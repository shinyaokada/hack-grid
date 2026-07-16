import type { Role, StageDefinition } from "@/data/stageSchema";

export interface RuntimeFile {
  exists: boolean;
  owner: Role;
  readableBy: Role[];
  content: string;
}

export interface LogEntry {
  id: number;
  commandText: string;
  lines: string[];
  isError: boolean;
}

export interface EngineState {
  role: Role;
  host: string;
  currentDir: string;
  files: Record<string, RuntimeFile>;
  filesystem: Record<string, string[]>;
  goalRevealed: boolean;
  log: LogEntry[];
}

export interface Session {
  stage: StageDefinition;
  state: EngineState;
  nextLogId: number;
}

export type Command =
  | { type: "ls" }
  | { type: "cd"; target: string }
  | { type: "read"; target: string }
  | { type: "inspect"; target: string }
  | { type: "run"; tool: string; arg?: string }
  | { type: "status" }
  | { type: "help" };

export interface CommandResult {
  lines: string[];
  isError: boolean;
}
