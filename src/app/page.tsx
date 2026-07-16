"use client";

import { useState } from "react";
import { ClearScreen } from "@/components/ClearScreen";
import { HomeGuideOverlay } from "@/components/HomeGuideOverlay";
import { KeyForm } from "@/components/KeyForm";
import { StagePicker } from "@/components/StagePicker";
import { StagePlayArea } from "@/components/StagePlayArea";
import { StoryScreen } from "@/components/StoryScreen";
import { TitleScreen } from "@/components/TitleScreen";
import { getNextStageId, getStageById, STAGES } from "@/data/stages";
import { useProgress } from "@/hooks/useProgress";

type Screen = "title" | "picker" | "story" | "cli" | "clear";

const FIRST_STAGE_ID = STAGES[0].stage;

export default function Home() {
  const progress = useProgress();
  const [screen, setScreen] = useState<Screen>("title");
  const [stageId, setStageId] = useState<string>(FIRST_STAGE_ID);
  const [showHomeGuide, setShowHomeGuide] = useState(false);

  const stage = getStageById(stageId);
  if (!stage) return null;

  function selectStage(id: string) {
    setStageId(id);
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
      <div className={`mx-auto ${screen === "cli" ? "max-w-6xl" : "max-w-4xl"}`}>
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
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setScreen("picker")}
              className="self-start text-xs text-green-600 underline hover:text-green-400"
            >
              ← ステージ選択に戻る（詰まったらやり直せます）
            </button>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <StagePlayArea key={stage.stage} stage={stage} />
              </div>
              <KeyForm
                digits={stage.goalAnswer.length}
                answer={stage.goalAnswer}
                onCorrect={handleCleared}
              />
            </div>
          </div>
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
