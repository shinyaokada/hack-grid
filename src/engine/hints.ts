import type { CommandName } from "@/data/stageSchema";

/** One-line tips shown once, in-terminal, the first time a stage introduces a command. */
export const COMMAND_HINTS: Partial<Record<CommandName, string>> = {
  inspect: "inspect でツールの仕様を見てみよう",
  run: "読めないなら、ツールに代わりに読ませてみよう",
  status: "今の自分の状態をまとめて見たいときは status",
};
