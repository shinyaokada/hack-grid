import { describe, expect, it } from "vitest";
import stage2_2 from "@/data/stages/2-2.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage2_2);

describe("stage 2-2: 資料変換室 (Chain / converter -> reader)", () => {
  it("the target path is discoverable via the room's memo", () => {
    const { steps } = runScript(stage, ["read memo.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("/root/keystore");
  });

  it("status works even though it doesn't touch the puzzle", () => {
    const { steps } = runScript(stage, ["status"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines[0]).toContain("reception-pc");
  });

  it("converter -> reader chain reveals 7712", () => {
    const { steps } = runScript(stage, [
      "run reader /root/keystore",
      "run converter /root/keystore",
      "run reader /cache/keystore.conv",
    ]);
    expect(steps[0].isError).toBe(true);
    const last = steps[steps.length - 1];
    expect(last.lines.join("\n")).toContain("7712");
    expect(last.goalRevealed).toBe(true);
  });
});
