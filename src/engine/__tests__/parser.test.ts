import { describe, expect, it } from "vitest";
import stage1_2 from "@/data/stages/1-2.json";
import { parseStage } from "@/data/stageSchema";
import { applyRawInput, createSession } from "@/engine/gameEngine";
import { parseInput } from "@/engine/parser";

describe("parseInput", () => {
  it("parses no-arg commands", () => {
    expect(parseInput("ls")).toEqual({ command: { type: "ls" } });
    expect(parseInput("  status  ")).toEqual({ command: { type: "status" } });
  });

  it("parses one-arg commands", () => {
    expect(parseInput("read /root/note")).toEqual({
      command: { type: "read", target: "/root/note" },
    });
    expect(parseInput("cd staff")).toEqual({ command: { type: "cd", target: "staff" } });
  });

  it("parses run with tool and optional arg", () => {
    expect(parseInput("run printer /root/note")).toEqual({
      command: { type: "run", tool: "printer", arg: "/root/note" },
    });
    expect(parseInput("run printer")).toEqual({
      command: { type: "run", tool: "printer", arg: undefined },
    });
  });

  it("rejects an unknown command name", () => {
    const result = parseInput("sudo rm -rf /");
    expect("error" in result && result.error).toContain("コマンドが見つかりません: sudo");
  });

  it("rejects a no-arg command given extra arguments", () => {
    const result = parseInput("ls extra");
    expect("error" in result && result.error).toContain("引数を取りません");
  });

  it("rejects a one-arg command with a missing argument", () => {
    const result = parseInput("read");
    expect("error" in result && result.error).toContain("使い方: read");
  });

  it("rejects run with no tool name", () => {
    const result = parseInput("run");
    expect("error" in result && result.error).toContain("使い方: run");
  });

  it("treats blank input as a no-op", () => {
    expect(parseInput("   ")).toEqual({ error: "" });
  });
});

describe("applyRawInput", () => {
  const stage = parseStage(stage1_2);

  it("runs a recognized command line end-to-end", () => {
    let session = createSession(stage);
    session = applyRawInput(session, "run printer /root/note");
    const entry = session.state.log[session.state.log.length - 1];
    expect(entry.isError).toBe(false);
    expect(entry.lines.join("\n")).toContain("4921");
  });

  it("surfaces a rejection line for typos without touching engine state", () => {
    let session = createSession(stage);
    session = applyRawInput(session, "reed /root/note");
    const entry = session.state.log[session.state.log.length - 1];
    expect(entry.isError).toBe(true);
    expect(entry.commandText).toBe("reed /root/note");
  });

  it("ignores a blank submission", () => {
    const session = createSession(stage);
    const after = applyRawInput(session, "   ");
    expect(after.state.log.length).toBe(0);
  });
});
