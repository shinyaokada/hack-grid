import { describe, expect, it } from "vitest";
import stage1_1 from "@/data/stages/1-1.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage1_1);

describe("stage 1-1: 受付端末", () => {
  it("ls shows memo.txt and staff/", () => {
    const { steps } = runScript(stage, ["ls"]);
    expect(steps[0].lines[0]).toContain("memo.txt");
    expect(steps[0].lines[0]).toContain("staff/");
  });

  it("cd staff is denied for guest", () => {
    const { steps } = runScript(stage, ["cd staff"]);
    expect(steps[0].isError).toBe(true);
    expect(steps[0].lines[0]).toBe("拒否: staff のみ入室可（あなた: guest）");
  });

  it("read memo.txt reveals the goal answer 7008", () => {
    const { steps } = runScript(stage, ["ls", "cd staff", "read memo.txt"]);
    const last = steps[steps.length - 1];
    expect(last.isError).toBe(false);
    expect(last.lines.join("\n")).toContain("7008");
    expect(last.goalRevealed).toBe(true);
  });
});
