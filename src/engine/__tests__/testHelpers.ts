import type { StageDefinition } from "@/data/stageSchema";
import { applyCommand, createSession } from "@/engine/gameEngine";
import type { Command, Session } from "@/engine/types";

export function cmd(text: string): Command {
  const [name, ...rest] = text.trim().split(/\s+/);
  switch (name) {
    case "ls":
      return { type: "ls" };
    case "status":
      return { type: "status" };
    case "help":
      return { type: "help" };
    case "cd":
      return { type: "cd", target: rest[0] };
    case "read":
      return { type: "read", target: rest[0] };
    case "inspect":
      return { type: "inspect", target: rest[0] };
    case "run":
      return { type: "run", tool: rest[0], arg: rest[1] };
    default:
      throw new Error(`unknown command: ${text}`);
  }
}

export interface StepResult {
  commandText: string;
  lines: string[];
  isError: boolean;
  goalRevealed: boolean;
}

/** Runs a sequence of textual commands against a fresh session, returning each step's output. */
export function runScript(stage: StageDefinition, script: string[]): {
  session: Session;
  steps: StepResult[];
} {
  let session = createSession(stage);
  const steps: StepResult[] = [];
  for (const text of script) {
    session = applyCommand(session, cmd(text));
    const entry = session.state.log[session.state.log.length - 1];
    steps.push({
      commandText: entry.commandText,
      lines: entry.lines,
      isError: entry.isError,
      goalRevealed: session.state.goalRevealed,
    });
  }
  return { session, steps };
}
