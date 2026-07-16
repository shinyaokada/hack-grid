import type { CommandName } from "@/data/stageSchema";
import type { Command } from "@/engine/types";

const COMMAND_NAMES: CommandName[] = [
  "ls",
  "cd",
  "read",
  "inspect",
  "run",
  "status",
  "help",
];

const NO_ARG_COMMANDS: CommandName[] = ["ls", "status", "help"];
const ONE_ARG_COMMANDS: CommandName[] = ["cd", "read", "inspect"];

export type ParseResult = { command: Command } | { error: string };

/** Parses a raw typed command line (e.g. "run printer /root/note") into a structured Command. */
export function parseInput(raw: string): ParseResult {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const [name, ...rest] = tokens;

  if (!name) {
    return { error: "" };
  }

  if (!COMMAND_NAMES.includes(name as CommandName)) {
    return { error: `コマンドが見つかりません: ${name}（help で一覧を確認できます）` };
  }
  const commandName = name as CommandName;

  if (NO_ARG_COMMANDS.includes(commandName)) {
    if (rest.length > 0) {
      return { error: `${commandName} は引数を取りません` };
    }
    return { command: { type: commandName as "ls" | "status" | "help" } };
  }

  if (ONE_ARG_COMMANDS.includes(commandName)) {
    if (rest.length === 0) {
      return { error: `使い方: ${commandName} <対象>` };
    }
    return { command: { type: commandName as "cd" | "read" | "inspect", target: rest[0] } };
  }

  // run
  if (rest.length === 0) {
    return { error: "使い方: run <ツール> [引数]" };
  }
  return { command: { type: "run", tool: rest[0], arg: rest[1] } };
}
