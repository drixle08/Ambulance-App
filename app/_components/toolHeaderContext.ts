"use client";

import { createContext, useContext } from "react";

/**
 * True for components rendered in ToolHeader's right-hand action slot.
 * Buttons there (e.g. CopySummaryButton) switch to a compact 48px icon style
 * that hides the text label on narrow screens, so the title has room.
 */
export const ToolHeaderActionsContext = createContext(false);

export const useInToolHeader = () => useContext(ToolHeaderActionsContext);
