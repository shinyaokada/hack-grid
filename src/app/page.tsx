"use client";

import { useState } from "react";
import { CliTerminal } from "@/components/CliTerminal";
import { ClearScreen } from "@/components/ClearScreen";
import { HomeGuideOverlay } from "@/components/HomeGuideOverlay";
import { KeyForm } from "@/components/KeyForm";
import { StagePicker } from "@/components/StagePicker";
import { StoryScreen } from "@/components/StoryScreen";
import { TitleScreen } from "@/components/TitleScreen";
import { getNextStageId, getStageById, STAGES } from "@/data/stages";
import { useProgress } from "@/hooks/useProgress";

type Screen = "title" | "picker" | "story" | "cli" | "keyform" | "clear";

const FIRST_STAGE_ID = STAGES[0].stage;

export default function Home() {
  const progress = useProgress();
  const [screen, setScreen] = useState<Screen>("title");
  const [stageId, setStageId] = useState<string>(FIRST_STAGE_ID);
  const [goalReady, setGoalReady] = useState(false);
  const [showHomeGuide, setShowHomeGuide] = useState(false);

  const stage = getStageById(stageId);
  if (!stage) return null;

  function selectStage(id: string) {
    setStageId(id);
    setGoalReady(false);
    setScreen("story");
  }

  function handleTitleStart() {
    if (!progress.hasLaunchedBefore) {
      progress.markLaunched();
      selectStage(FIRST_STAGE_ID);
    } else {
      setScreen("picker");
    }
  }

  function handleCleared() {
    progress.markCleared(stage!.stage);
    setScreen("clear");
  }

  function handleContinueFromClear() {
    if (stage!.stage === FIRST_STAGE_ID && !progress.hasSeenHomeGuide) {
      setShowHomeGuide(true);
    }
    setScreen("picker");
  }

  const nextStageId = getNextStageId(stage.stage);
  const isFirstStage = stage.stage === FIRST_STAGE_ID;

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-green-200">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-center font-mono text-xl text-green-400">
          $ ハッキング風パズルゲーム
        </h1>

        {screen === "title" && <TitleScreen onStart={handleTitleStart} />}

        {screen === "picker" && (
          <div className="relative">
            <StagePicker stages={STAGES} clearedIds={progress.clearedIds} onSelect={selectStage} />
            {showHomeGuide && (
              <HomeGuideOverlay
                totalStages={STAGES.length}
                onDismiss={() => {
                  progress.markHomeGuideSeen();
                  setShowHomeGuide(false);
                }}
              />
            )}
          </div>
        )}

        {screen === "story" && <StoryScreen stage={stage} onStart={() => setScreen("cli")} />}

        {screen === "cli" && (
          <div className="flex flex-col gap-4">
            <CliTerminal
              key={stage.stage}
              stage={stage}
              onGoalReady={setGoalReady}
              usedCommands={progress.usedCommands}
              onCommandUsed={progress.markCommandUsed}
            />
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
            onCorrect={handleCleared}
            onBack={() => setScreen("cli")}
          />
        )}

        {screen === "clear" && (
          <ClearScreen
            stage={stage}
            hasNext={Boolean(nextStageId)}
            isFirstStage={isFirstStage}
            onNext={() => nextStageId && selectStage(nextStageId)}
            onHome={() => setScreen("picker")}
            onContinue={handleContinueFromClear}
          />
        )}
      </div>
    </div>
  );
}
