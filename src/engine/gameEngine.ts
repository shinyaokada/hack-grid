import type { StageDefinition } from "@/data/stageSchema";
import type { Command, EngineState, LogEntry, Session, Snapshot } from "@/engine/types";
import {
  handleCd,
  handleHelp,
  handleInspect,
  handleLs,
  handleRead,
  handleRun,
  handleStatus,
} from "@/engine/commands";

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

  return {
    stage,
    state: {
      role: stage.playerRole,
      host: stage.host,
      currentDir: Object.keys(stage.filesystem)[0] ?? "/home/guest",
      files,
      filesystem,
      goalRevealed: false,
      log: [],
    },
    past: [],
    nextLogId: 1,
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
    case "back":
      return "back";
  }
}

function snapshotOf(state: EngineState): Snapshot {
  return {
    files: structuredClone(state.files),
    filesystem: structuredClone(state.filesystem),
    currentDir: state.currentDir,
    goalRevealed: state.goalRevealed,
    logLength: state.log.length,
  };
}

function applyBack(session: Session): Session {
  const state = structuredClone(session.state);

  if (session.past.length === 0) {
    const logEntry: LogEntry = {
      id: session.nextLogId,
      commandText: "back",
      lines: ["拒否: これ以上戻れません"],
      isError: true,
      reverted: false,
    };
    state.log = [...state.log, logEntry];
    return { ...session, state, nextLogId: session.nextLogId + 1 };
  }

  const snapshot = session.past[session.past.length - 1];
  const newPast = session.past.slice(0, -1);

  state.files = structuredClone(snapshot.files);
  state.filesystem = structuredClone(snapshot.filesystem);
  state.currentDir = snapshot.currentDir;
  state.goalRevealed = snapshot.goalRevealed;
  state.log = state.log.map((entry, idx) =>
    idx === snapshot.logLength ? { ...entry, reverted: true } : entry,
  );

  const backEntry: LogEntry = {
    id: session.nextLogId,
    commandText: "back",
    lines: ["直前の操作を取り消しました"],
    isError: false,
    reverted: false,
  };
  state.log = [...state.log, backEntry];

  return { stage: session.stage, state, past: newPast, nextLogId: session.nextLogId + 1 };
}

export function applyCommand(session: Session, command: Command): Session {
  if (command.type === "back") {
    return applyBack(session);
  }

  const stage = session.stage;
  const state = structuredClone(session.state);
  const commandText = renderCommand(command);
  const preMutationSnapshot = snapshotOf(state);

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

  const past = result.mutated ? [...session.past, preMutationSnapshot] : session.past;

  if (!state.goalRevealed && result.lines.some((line) => line.includes(stage.goalAnswer))) {
    state.goalRevealed = true;
  }

  const logEntry: LogEntry = {
    id: session.nextLogId,
    commandText,
    lines: result.lines,
    isError: result.isError,
    reverted: false,
  };
  state.log = [...state.log, logEntry];

  return { stage, state, past, nextLogId: session.nextLogId + 1 };
}
