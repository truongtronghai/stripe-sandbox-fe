"use client";

import { createContext, useContext } from "react";
import type { PlanSelectionResponse, SelectPlanRequest } from "@/types/plan-message";

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export interface WebSocketContextValue {
  status: WebSocketStatus;
  lastMessage: PlanSelectionResponse | null;
  isProcessing: boolean;
  send: (data: SelectPlanRequest) => void;
  reconnect: () => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error("useWebSocket must be used within a <WebSocketProvider>");
  }
  return context;
}
