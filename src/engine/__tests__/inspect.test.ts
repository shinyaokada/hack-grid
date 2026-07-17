import { describe, expect, it } from "vitest";
import stage1_1 from "@/data/stages/1-1.json";
import stage1_2 from "@/data/stages/1-2.json";
import stage1_4 from "@/data/stages/1-4.json";
import { parseStage } from "@/data/stageSchema";
import { runScript } from "./testHelpers";

describe("inspect on tools (existing behavior)", () => {
  it("still shows the tool's inspectText", () => {
    const stage = parseStage(stage1_2);
    const { steps } = runScript(stage, ["inspect printer"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("run printer <ファイル>");
  });
});

describe("inspect on files", () => {
  it("reveals owner and read permission for a root-only file without needing read access", () => {
    const stage = parseStage(stage1_2);
    const { steps } = runScript(stage, ["inspect /root/note.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("所有者: root");
    expect(steps[0].lines.join("\n")).toContain("読み取り可: root");
  });

  it("works on a guest-readable file too", () => {
    const stage = parseStage(stage1_2);
    const { steps } = runScript(stage, ["inspect memo.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("読み取り可: guest, root");
  });

  it("reports a deleted file as gone, not as an unknown target", () => {
    const stage = parseStage(stage1_4);
    const { steps } = runScript(stage, ["run shredder /root/gatecode", "inspect /root/gatecode"]);
    expect(steps[1].isError).toBe(true);
    expect(steps[1].lines[0]).toBe("拒否: ファイルが存在しません");
  });

  it("rejects a completely unknown path", () => {
    const stage = parseStage(stage1_2);
    const { steps } = runScript(stage, ["inspect /no/such/file"]);
    expect(steps[0].isError).toBe(true);
  });
});

describe("inspect on directories", () => {
  it("reveals the entry permission for a restricted directory without needing to cd", () => {
    const stage = parseStage(stage1_1);
    const { steps } = runScript(stage, ["inspect staff"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("種別: ディレクトリ");
    expect(steps[0].lines.join("\n")).toContain("入室可: staff");
  });
});
