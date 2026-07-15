import { describe, expect, it } from "vitest";
import stage2_4 from "@/data/stages/2-4.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage2_4);

describe("stage 2-4: 倉庫の奥 (Chain / 3-hop collector -> packager -> viewer)", () => {
  it("packager refuses a path outside /pool/incoming/", () => {
    const { steps } = runScript(stage, ["run packager /root/vaultcore"]);
    expect(steps[0].isError).toBe(true);
  });

  it("the cosmetic decoy labeler never blocks progress", () => {
    const { steps } = runScript(stage, [
      "run collector /root/vaultcore",
      "run labeler /pool/incoming/vaultcore",
    ]);
    expect(steps[1].isError).toBe(false);
    expect(steps[1].lines.join("\n")).toContain("ラベルを貼りました");
  });

  it("collector -> packager -> viewer chain reveals 6027", () => {
    const { steps } = runScript(stage, [
      "run collector /root/vaultcore",
      "run packager /pool/incoming/vaultcore",
      "run viewer /pool/packed/vaultcore.pkg",
    ]);
    const last = steps[steps.length - 1];
    expect(last.isError).toBe(false);
    expect(last.lines.join("\n")).toContain("6027");
    expect(last.lines.join("\n")).toContain("を解読");
    expect(last.goalRevealed).toBe(true);
  });

  it("skipping the packager step is rejected by viewer", () => {
    const { steps } = runScript(stage, [
      "run collector /root/vaultcore",
      "run viewer /pool/incoming/vaultcore",
    ]);
    const last = steps[steps.length - 1];
    expect(last.isError).toBe(true);
  });
});
