import type { StageDefinition } from "@/data/stageSchema";
import { COMMAND_HINTS } from "@/engine/hints";
import type { Command, EngineState, LogEntry, Session } from "@/engine/types";
import {
  handleCd,
  handleHelp,
  handleInspect,
  handleLs,
  handleRead,
  handleRun,
  handleStatus,
} from "@/engine/commands";
import { parseInput } from "@/engine/parser";

export function createSession(stage: StageDefinition): Session {
  const files: EngineState["files"] = {};
  for (const [path, def] of Object.entries(stage.files)) {
    files[path] = {
      exists: true,
      owner: def.owner,
      readableBy: def.readableBy,
      content: def.content,
    };
  }
  const filesystem: EngineState["filesystem"] = {};
  for (const [dir, entries] of Object.entries(stage.filesystem)) {
    filesystem[dir] = [...entries];
  }

  const log: LogEntry[] = [];
  let nextLogId = 1;
  const hintLines = stage.newCommands
    .filter((name) => COMMAND_HINTS[name])
    .map((name) => `NEW: ${name} — ${COMMAND_HINTS[name]}`);
  if (hintLines.length > 0) {
    log.push({ id: nextLogId++, commandText: "", lines: hintLines, isError: false, isSystem: true });
  }

  return {
    stage,
    state: {
      role: stage.playerRole,
      host: stage.host,
      currentDir: Object.keys(stage.filesystem)[0] ?? "/home/guest",
      files,
      filesystem,
      goalRevealed: false,
      log,
    },
    nextLogId,
  };
}

export function renderCommand(command: Command): string {
  switch (command.type) {
    case "ls":
      return "ls";
    case "cd":
      return `cd ${command.target}`;
    case "read":
      return `read ${command.target}`;
    case "inspect":
      return `inspect ${command.target}`;
    case "run":
      return command.arg ? `run ${command.tool} ${command.arg}` : `run ${command.tool}`;
    case "status":
      return "status";
    case "help":
      return "help";
  }
}

export function applyCommand(session: Session, command: Command): Session {
  const stage = session.stage;
  const state = structuredClone(session.state);
  const commandText = renderCommand(command);

  const result = (() => {
    switch (command.type) {
      case "ls":
        return handleLs(state);
      case "cd":
        return handleCd(state, stage, command.target);
      case "read":
        return handleRead(state, command.target);
      case "inspect":
        return handleInspect(stage, command.target);
      case "run":
        return handleRun(state, stage, command.tool, command.arg);
      case "status":
        return handleStatus(state);
      case "help":
        return handleHelp();
    }
  })();

  if (!state.goalRevealed && result.lines.some((line) => line.includes(stage.goalAnswer))) {
    state.goalRevealed = true;
  }

  const logEntry: LogEntry = {
    id: session.nextLogId,
    commandText,
    lines: result.lines,
    isError: result.isError,
  };
  state.log = [...state.log, logEntry];

  return { stage, state, nextLogId: session.nextLogId + 1 };
}

/** Parses a raw typed command line and applies it, or appends a rejection line if it doesn't parse. */
export function applyRawInput(session: Session, raw: string): Session {
  const parsed = parseInput(raw);
  if ("error" in parsed) {
    if (!parsed.error) return session; // blank submission: no-op
    const state = structuredClone(session.state);
    const logEntry: LogEntry = {
      id: session.nextLogId,
      commandText: raw.trim(),
      lines: [parsed.error],
      isError: true,
    };
    state.log = [...state.log, logEntry];
    return { ...session, state, nextLogId: session.nextLogId + 1 };
  }
  return applyCommand(session, parsed.command);
}
