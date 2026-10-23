/**
 * RACE scale (Rapid Arterial oCclusion Evaluation) — CPG 3.1 Stroke (edition: RACE_EDITION).
 * Used with BEFAST to identify strokes associated with large vessel occlusion.
 */

import { cpgEdition } from "./cpgEdition";

/** Edition the RACE items and threshold were last checked against. */
export const RACE_EDITION = cpgEdition("2.6");

export type Hemiparesis = "right" | "left";
export type RaceKey = "face" | "arm" | "leg" | "gaze" | "cortical";
export type RaceScores = Record<RaceKey, number | null>;

export type RaceItem = {
  key: RaceKey;
  label: string;
  options: { score: number; label: string }[];
};

/** Score at or above this suggests a large vessel occlusion. */
export const RACE_LVO_THRESHOLD = 5;
export const RACE_MAX_SCORE = 9;
export const RACE_VIDEO_URL = "https://youtu.be/9-65gGKgx_k";

const MOTOR_ITEMS: RaceItem[] = [
  {
    key: "face",
    label: "Facial palsy",
    options: [
      { score: 0, label: "Absent" },
      { score: 1, label: "Mild" },
      { score: 2, label: "Moderate / severe" },
    ],
  },
  {
    key: "arm",
    label: "Arm motor impairment",
    options: [
      { score: 0, label: "Normal / mild" },
      { score: 1, label: "Moderate" },
      { score: 2, label: "Severe" },
    ],
  },
  {
    key: "leg",
    label: "Leg motor impairment",
    options: [
      { score: 0, label: "Normal / mild" },
      { score: 1, label: "Moderate" },
      { score: 2, label: "Severe" },
    ],
  },
  {
    key: "gaze",
    label: "Head & gaze deviation",
    options: [
      { score: 0, label: "Absent" },
      { score: 1, label: "Present" },
    ],
  },
];

const APHASIA_ITEM: RaceItem = {
  key: "cortical",
  label: "Aphasia — “Close your eyes” & “Make a fist”",
  options: [
    { score: 0, label: "Performs both tasks" },
    { score: 1, label: "Performs 1 task" },
    { score: 2, label: "Performs neither" },
  ],
};

const AGNOSIA_ITEM: RaceItem = {
  key: "cortical",
  label: "Agnosia — “Whose arm is this?” & “Lift both arms and clap”",
  options: [
    { score: 0, label: "Recognises arm and impairment" },
    { score: 1, label: "Unable to recognise arm or impairment" },
    { score: 2, label: "Unable to recognise both" },
  ],
};

export const EMPTY_RACE: RaceScores = {
  face: null,
  arm: null,
  leg: null,
  gaze: null,
  cortical: null,
};

/** Aphasia is tested with right hemiparesis, agnosia with left. */
export function raceItems(hemiparesis: Hemiparesis): RaceItem[] {
  return [...MOTOR_ITEMS, hemiparesis === "right" ? APHASIA_ITEM : AGNOSIA_ITEM];
}

/** Total score, or null until every item has been scored. */
export function raceTotal(scores: RaceScores): number | null {
  const values = Object.values(scores);
  if (values.some((v) => v === null)) return null;
  return values.reduce<number>((sum, v) => sum + (v ?? 0), 0);
}
