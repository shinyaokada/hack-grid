"use client";

import { useState } from "react";
import { CliTerminal } from "@/components/CliTerminal";
import { ClearScreen } from "@/components/ClearScreen";
import { KeyForm } from "@/components/KeyForm";
import { StagePicker } from "@/components/StagePicker";
import { StoryScreen } from "@/components/StoryScreen";
import { getNextStageId, getStageById, STAGES } from "@/data/stages";

type Screen = "picker" | "story" | "cli" | "keyform" | "clear";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("picker");
  const [stageId, setStageId] = useState<string>(STAGES[0].stage);
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());
  const [goalReady, setGoalReady] = useState(false);

  const stage = getStageById(stageId);
  if (!stage) return null;

  function selectStage(id: string) {
    setStageId(id);
    setGoalReady(false);
    setScreen("story");
  }

  function markCleared() {
    const clearedStageId = stage!.stage;
    setClearedIds((prev) => new Set(prev).add(clearedStageId));
    setScreen("clear");
  }

  const nextStageId = getNextStageId(stage.stage);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-green-200">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-center font-mono text-xl text-green-400">
          $ ハッキング風パズルゲーム
        </h1>

        {screen === "picker" && (
          <StagePicker stages={STAGES} clearedIds={clearedIds} onSelect={selectStage} />
        )}

        {screen === "story" && (
          <StoryScreen stage={stage} onStart={() => setScreen("cli")} />
        )}

        {screen === "cli" && (
          <div className="flex flex-col gap-4">
            <CliTerminal key={stage.stage} stage={stage} onGoalReady={setGoalReady} />
            {goalReady && (
              <div className="text-center">
                <button
                  onClick={() => setScreen("keyform")}
                  className="rounded border border-yellow-600 bg-yellow-900/30 px-4 py-2 text-yellow-300 hover:bg-yellow-900/60"
                >
                  回答する
                </button>
              </div>
            )}
          </div>
        )}

        {screen === "keyform" && (
          <KeyForm
            digits={stage.goalAnswer.length}
            answer={stage.goalAnswer}
            onCorrect={markCleared}
            onBack={() => setScreen("cli")}
          />
        )}

        {screen === "clear" && (
          <ClearScreen
            stage={stage}
            hasNext={Boolean(nextStageId)}
            onNext={() => nextStageId && selectStage(nextStageId)}
            onHome={() => setScreen("picker")}
          />
        )}
      </div>
    </div>
  );
}
