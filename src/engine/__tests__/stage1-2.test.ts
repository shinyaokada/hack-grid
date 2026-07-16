import { describe, expect, it } from "vitest";
import stage1_2 from "@/data/stages/1-2.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage1_2);

describe("stage 1-2: 受付端末・裏側 (Confused Deputy / printer)", () => {
  it("the target path is discoverable via the handover memo", () => {
    const { steps } = runScript(stage, ["read memo.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("/root/note.txt");
  });

  it("direct read of /root/note.txt is denied", () => {
    const { steps } = runScript(stage, ["read /root/note.txt"]);
    expect(steps[0].isError).toBe(true);
    expect(steps[0].lines[0]).toBe("拒否: root のみ読み取り可（あなた: guest）");
  });

  it("inspect printer reveals its spec", () => {
    const { steps } = runScript(stage, ["inspect printer"]);
    expect(steps[0].lines.join("\n")).toContain("run printer <ファイル>");
  });

  it("run printer /root/note.txt reveals the goal answer 4921", () => {
    const { steps } = runScript(stage, [
      "ls",
      "read /root/note.txt",
      "inspect printer",
      "run printer /root/note.txt",
    ]);
    const last = steps[steps.length - 1];
    expect(last.isError).toBe(false);
    expect(last.lines.join("\n")).toContain("4921");
    expect(last.goalRevealed).toBe(true);
  });
});
