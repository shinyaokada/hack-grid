import { describe, expect, it } from "vitest";
import stage1_4 from "@/data/stages/1-4.json";
import { parseStage } from "@/data/stageSchema";
import { applyCommand } from "@/engine/gameEngine";
import { cmd, runScript } from "./testHelpers";

const stage = parseStage(stage1_4);

describe("stage 1-4: 通用口ログ (Confused Deputy / logger + back)", () => {
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

  it("running the decoy shredder destroys the source file, and back restores it", () => {
    const { session, steps } = runScript(stage, [
      "run shredder /root/gatecode",
      "read /root/gatecode",
    ]);
    expect(steps[0].lines.join("\n")).toContain("削除しました");
    expect(steps[1].isError).toBe(true);
    expect(steps[1].lines[0]).toBe("拒否: ファイルが存在しません");

    // back should undo the shredder run and restore the file
    let s = applyCommand(session, cmd("back"));
    const backEntry = s.state.log[s.state.log.length - 1];
    expect(backEntry.lines[0]).toBe("直前の操作を取り消しました");

    s = applyCommand(s, cmd("read /root/gatecode"));
    const readEntry = s.state.log[s.state.log.length - 1];
    expect(readEntry.isError).toBe(true); // still root-only, but the file exists again
    expect(readEntry.lines[0]).toBe("拒否: root のみ読み取り可（あなた: guest）");
  });

  it("back with nothing to undo reports a rejection", () => {
    const { steps } = runScript(stage, ["back"]);
    expect(steps[0].isError).toBe(true);
    expect(steps[0].lines[0]).toBe("拒否: これ以上戻れません");
  });
});
