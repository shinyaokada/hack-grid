import { describe, expect, it } from "vitest";
import stage1_3 from "@/data/stages/1-3.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage1_3);

describe("stage 1-3: 資料室 (Confused Deputy / backup)", () => {
  it("the target path is discoverable via the archive room's memo", () => {
    const { steps } = runScript(stage, ["read memo.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("/root/idcard.csv");
  });

  it("direct read of /root/idcard.csv is denied", () => {
    const { steps } = runScript(stage, ["read /root/idcard.csv"]);
    expect(steps[0].isError).toBe(true);
  });

  it("run backup only copies; goal is not revealed until the copy is read", () => {
    const { steps } = runScript(stage, ["run backup /root/idcard.csv"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("/backup/idcard.csv に複製しました");
    expect(steps[0].goalRevealed).toBe(false);
  });

  it("run backup then read /backup/idcard.csv reveals 5533", () => {
    const { steps } = runScript(stage, [
      "inspect backup",
      "run backup /root/idcard.csv",
      "read /backup/idcard.csv",
    ]);
    const last = steps[steps.length - 1];
    expect(last.isError).toBe(false);
    expect(last.lines.join("\n")).toContain("5533");
    expect(last.goalRevealed).toBe(true);
  });
});
