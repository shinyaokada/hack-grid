import { describe, expect, it } from "vitest";
import stage2_1 from "@/data/stages/2-1.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

const stage = parseStage(stage2_1);

describe("stage 2-1: サーバー室・搬入口 (Chain / exporter -> printer)", () => {
  it("the target path is discoverable in-game via ls + read, not just via story text", () => {
    const { steps } = runScript(stage, ["ls", "read memo.txt"]);
    expect(steps[0].lines[0]).toContain("memo.txt");
    expect(steps[1].isError).toBe(false);
    expect(steps[1].lines.join("\n")).toContain("/root/serverroom");
  });

  it("printer refuses paths outside /tmp/", () => {
    const { steps } = runScript(stage, ["run printer /root/serverroom"]);
    expect(steps[0].isError).toBe(true);
    expect(steps[0].lines[0]).toBe("拒否: /tmp/ 以下のファイルのみ許可");
  });

  it("exporter -> printer chain reveals 3390, and /tmp/out is not directly readable", () => {
    const { steps } = runScript(stage, [
      "run printer /root/serverroom",
      "inspect exporter",
      "run exporter /root/serverroom",
      "read /tmp/out",
      "run printer /tmp/out",
    ]);
    const directRead = steps[3];
    expect(directRead.isError).toBe(true); // /tmp/out stays root-only even after export

    const last = steps[steps.length - 1];
    expect(last.isError).toBe(false);
    expect(last.lines.join("\n")).toContain("3390");
    expect(last.goalRevealed).toBe(true);
  });
});
