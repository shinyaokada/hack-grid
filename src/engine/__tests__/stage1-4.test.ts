import { describe, expect, it } from "vitest";
import stage1_4 from "@/data/stages/1-4.json";
import { parseStage } from "@/data/stageSchema";
import { createSession } from "@/engine/gameEngine";
import { runScript } from "./testHelpers";

const stage = parseStage(stage1_4);

describe("stage 1-4: 通用口ログ (Confused Deputy / logger)", () => {
  it("both target paths are discoverable via the gate's memo", () => {
    const { steps } = runScript(stage, ["read memo.txt"]);
    expect(steps[0].isError).toBe(false);
    expect(steps[0].lines.join("\n")).toContain("/root/gatecode");
    expect(steps[0].lines.join("\n")).toContain("/var/log/access.log");
  });

  it("run logger then read the log reveals 8264", () => {
    const { steps } = runScript(stage, [
      "read /root/gatecode",
      "inspect logger",
      "run logger /root/gatecode",
      "read /var/log/access.log",
    ]);
    const last = steps[steps.length - 1];
    expect(last.isError).toBe(false);
    expect(last.lines.join("\n")).toContain("8264");
    expect(last.goalRevealed).toBe(true);
  });

  it("inspect warns that the decoy shredder is irreversible before it is ever run", () => {
    const { steps } = runScript(stage, ["inspect shredder"]);
    expect(steps[0].lines.join("\n")).toContain("元に戻せません");
  });

  it("running the decoy shredder permanently destroys the source file for this session", () => {
    const { steps } = runScript(stage, [
      "run shredder /root/gatecode",
      "read /root/gatecode",
    ]);
    expect(steps[0].lines.join("\n")).toContain("削除しました");
    expect(steps[1].isError).toBe(true);
    expect(steps[1].lines[0]).toBe("拒否: ファイルが存在しません");
  });

  it("the only recovery from shredding is a fresh session (i.e. retrying the stage)", () => {
    const freshSession = createSession(stage);
    expect(freshSession.state.files["/root/gatecode"].exists).toBe(true);
  });
});
