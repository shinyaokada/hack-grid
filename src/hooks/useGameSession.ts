"use client";

import { useReducer } from "react";
import type { StageDefinition } from "@/data/stageSchema";
import { applyRawInput, createSession } from "@/engine/gameEngine";
import type { Session } from "@/engine/types";

function sessionReducer(session: Session, raw: string): Session {
  return applyRawInput(session, raw);
}

/** One shared game session that multiple terminal panes can dispatch into. */
export function useGameSession(stage: StageDefinition) {
  return useReducer(sessionReducer, stage, createSession);
}
