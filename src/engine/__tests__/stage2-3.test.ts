import { describe, expect, it } from "vitest";
import stage2_3 from "@/data/stages/2-3.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage2_3);

describe("stage 2-3: 共有フォルダ (Chain / archiver -> extractor)", () => {
  it("the target path is discoverable via the folder's memo", () => {
    const { steps } = runScript(stage, ["read memo.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("/root/manifest");
  });

  it("archiver -> extractor chain reveals 1849", () => {
    const { steps } = runScript(stage, [
      "run extractor /root/manifest",
      "run archiver /root/manifest",
      "run extractor /share/manifest.zip",
    ]);
    expect(steps[0].isError).toBe(true);
    const last = steps[steps.length - 1];
    expect(last.lines.join("\n")).toContain("1849");
    expect(last.lines.join("\n")).toContain("を解凍");
    expect(last.goalRevealed).toBe(true);
  });
});
