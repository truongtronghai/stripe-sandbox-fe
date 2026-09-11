"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  parsePlanSelectionMessage,
  type PlanSelectionResponse,
  type SelectPlanRequest,
} from "@/types/plan-message";
import {
  WebSocketContext,
  type WebSocketContextValue,
  type WebSocketStatus,
} from "@/hooks/use-websocket";

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "";
const OPEN_READY_STATE = 1;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 5000];

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<WebSocketStatus>("connecting");
  const [lastMessage, setLastMessageState] = useState<PlanSelectionResponse | null>(null);
  const [pendingPlanId, setPendingPlanIdState] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const pendingPlanIdRef = useRef<string | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    if (pendingPlanIdRef.current !== null) {
      pendingPlanIdRef.current = null;
      setPendingPlanIdState(null);
      setLastMessageState({ type: "error", message: "Connection lost; please try again" });
    }
    setStatusState("reconnecting");
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null) return;
    const attempt = reconnectAttemptRef.current;
    const delay = RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      reconnectAttemptRef.current += 1;
      connectRef.current();
    }, delay);
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimer();

    const socket = new WebSocket(WEBSOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      if (socketRef.current !== socket) return;
      reconnectAttemptRef.current = 0;
      setStatusState("connected");
    };

    socket.onmessage = (event: MessageEvent) => {
      if (socketRef.current !== socket) return;
      const message = parsePlanSelectionMessage(event.data);
      if (!message) return;
      if (message.type === "success" || message.type === "error") {
        pendingPlanIdRef.current = null;
        setPendingPlanIdState(null);
      }
      setLastMessageState(message);
    };

    socket.onclose = () => {
      if (socketRef.current !== socket) return;
      handleDisconnect();
      scheduleReconnect();
    };

    socket.onerror = () => {
      if (socketRef.current !== socket) return;
    };
  }, [clearReconnectTimer, handleDisconnect, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    console.log(`[websocket] status: ${status}`);
  }, [status]);

  useEffect(() => {
    connect();

    return () => {
      clearReconnectTimer();
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
    };
  }, [connect, clearReconnectTimer]);

  const send = (data: SelectPlanRequest) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== OPEN_READY_STATE) return;
    pendingPlanIdRef.current = data.planId;
    setPendingPlanIdState(data.planId);
    const request: SelectPlanRequest = {
      type: data.type,
      planId: data.planId,
      email: data.email,
      token: data.token,
      accountName: data.accountName,
    };
    socket.send(JSON.stringify(request));
  };

  const reconnect = () => {
    const socket = socketRef.current;
    if (socket && socket.readyState === OPEN_READY_STATE) return;
    clearReconnectTimer();
    reconnectAttemptRef.current = 0;
    connect();
  };

  const isProcessing =
    status === "connected" && (pendingPlanId !== null || lastMessage?.type === "inProgress");

  const value: WebSocketContextValue = {
    status,
    lastMessage,
    isProcessing,
    send,
    reconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}
