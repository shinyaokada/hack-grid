import { parseStage, type StageDefinition } from "@/data/stageSchema";

import stage1_1 from "./1-1.json";
import stage1_2 from "./1-2.json";
import stage1_3 from "./1-3.json";
import stage1_4 from "./1-4.json";
import stage2_1 from "./2-1.json";
import stage2_2 from "./2-2.json";
import stage2_3 from "./2-3.json";
import stage2_4 from "./2-4.json";

const rawStages = [
  stage1_1,
  stage1_2,
  stage1_3,
  stage1_4,
  stage2_1,
  stage2_2,
  stage2_3,
  stage2_4,
];

export const STAGES: StageDefinition[] = rawStages.map((raw) => parseStage(raw));

export const STAGE_ORDER: string[] = STAGES.map((s) => s.stage);

export function getStageById(id: string): StageDefinition | undefined {
  return STAGES.find((s) => s.stage === id);
}

export function getStageIndex(id: string): number {
  return STAGE_ORDER.indexOf(id);
}

export function getNextStageId(id: string): string | null {
  const idx = getStageIndex(id);
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

export function isStageUnlocked(id: string, clearedStageIds: Set<string>): boolean {
  const idx = getStageIndex(id);
  if (idx <= 0) return true;
  const prevId = STAGE_ORDER[idx - 1];
  return clearedStageIds.has(prevId);
}
