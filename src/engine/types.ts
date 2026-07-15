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
  reverted: boolean;
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

export interface Snapshot {
  files: Record<string, RuntimeFile>;
  filesystem: Record<string, string[]>;
  currentDir: string;
  goalRevealed: boolean;
  /** number of log entries that existed right before the mutating command ran */
  logLength: number;
}

export interface Session {
  stage: StageDefinition;
  state: EngineState;
  past: Snapshot[];
  nextLogId: number;
}

export type Command =
  | { type: "ls" }
  | { type: "cd"; target: string }
  | { type: "read"; target: string }
  | { type: "inspect"; target: string }
  | { type: "run"; tool: string; arg?: string }
  | { type: "status" }
  | { type: "help" }
  | { type: "back" };

export interface CommandResult {
  lines: string[];
  isError: boolean;
  /** true when this command changed file/filesystem state and should be undoable via `back` */
  mutated?: boolean;
}
