"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ShieldAlert, HeartPulse, Wind, Brain, BookOpen, Activity,
  FlaskConical, FilePenLine, Globe,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TOOL_GROUPS, type ToolGroup } from "./data";

const ORDER_KEY = "dashboard-group-order";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert, HeartPulse, Wind, Brain, BookOpen, Activity,
  FlaskConical, FilePenLine, Globe,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; hover: string; ring: string }> = {
  orange: { bg: "bg-orange-500/10 dark:bg-orange-500/15", icon: "text-orange-600 dark:text-orange-300", hover: "hover:border-orange-400/60 dark:hover:border-orange-400/50", ring: "group-hover:ring-orange-400/30" },
  red:    { bg: "bg-red-500/10 dark:bg-red-500/15",       icon: "text-red-600 dark:text-red-300",       hover: "hover:border-red-400/60 dark:hover:border-red-400/50",       ring: "group-hover:ring-red-400/30" },
  sky:    { bg: "bg-sky-500/10 dark:bg-sky-500/15",       icon: "text-sky-600 dark:text-sky-300",       hover: "hover:border-sky-400/60 dark:hover:border-sky-400/50",       ring: "group-hover:ring-sky-400/30" },
  violet: { bg: "bg-violet-500/10 dark:bg-violet-500/15", icon: "text-violet-600 dark:text-violet-300", hover: "hover:border-violet-400/60 dark:hover:border-violet-400/50", ring: "group-hover:ring-violet-400/30" },
  amber:  { bg: "bg-amber-500/10 dark:bg-amber-500/15",   icon: "text-amber-600 dark:text-amber-300",   hover: "hover:border-amber-400/60 dark:hover:border-amber-400/50",   ring: "group-hover:ring-amber-400/30" },
  teal:   { bg: "bg-teal-500/10 dark:bg-teal-500/15",     icon: "text-teal-600 dark:text-teal-300",     hover: "hover:border-teal-400/60 dark:hover:border-teal-400/50",     ring: "group-hover:ring-teal-400/30" },
  rose:   { bg: "bg-rose-500/10 dark:bg-rose-500/15",     icon: "text-rose-600 dark:text-rose-300",     hover: "hover:border-rose-400/60 dark:hover:border-rose-400/50",     ring: "group-hover:ring-rose-400/30" },
  blue:   { bg: "bg-blue-500/10 dark:bg-blue-500/15",     icon: "text-blue-600 dark:text-blue-300",     hover: "hover:border-blue-400/60 dark:hover:border-blue-400/50",     ring: "group-hover:ring-blue-400/30" },
};

function SortableCard({
  group,
  anyDragging,
}: {
  group: ToolGroup;
  anyDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition ?? undefined,
  };

  const Icon = ICON_MAP[group.icon] ?? BookOpen;
  const color = COLOR_MAP[group.color] ?? COLOR_MAP.amber;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none select-none ${isDragging ? "z-50 relative" : ""}`}
      {...attributes}
      {...listeners}
    >
      <Link
        href={`/dashboard/${group.slug}`}
        draggable={false}
        onClick={(e) => { if (anyDragging) e.preventDefault(); }}
        className={`app-card group flex min-h-40 flex-col items-center justify-center gap-4 rounded-3xl border p-6 text-center shadow-sm transition-all
          ${isDragging
            ? "scale-[1.06] shadow-2xl ring-2 ring-emerald-400/60 border-emerald-500/40 opacity-95"
            : anyDragging
              ? "opacity-60"
              : `active:scale-95 ${color.hover} hover:shadow-md`}
        `}
      >
        <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${color.bg} ring-4 ring-transparent transition-all ${color.ring}`}>
          <Icon className={`h-10 w-10 ${color.icon}`} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-black leading-tight text-slate-900 dark:text-slate-50">
            {group.shortTitle ?? group.title}
          </h2>
          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {group.tools.length} {group.tools.length === 1 ? "tool" : "tools"}
          </span>
        </div>
      </Link>
    </div>
  );
}

export function DashboardGrid() {
  const [groups, setGroups] = useState<ToolGroup[]>(TOOL_GROUPS);
  const [anyDragging, setAnyDragging] = useState(false);

  // Restore saved order on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORDER_KEY);
      if (!saved) return;
      const order = JSON.parse(saved) as string[];
      const sorted = order
        .map((slug) => TOOL_GROUPS.find((g) => g.slug === slug))
        .filter(Boolean) as ToolGroup[];
      const missing = TOOL_GROUPS.filter((g) => !order.includes(g.slug));
      if (sorted.length > 0) setGroups([...sorted, ...missing]);
    } catch { /* ignore */ }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 12 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 800, tolerance: 10 },
    })
  );

  function handleDragStart(_e: DragStartEvent) {
    setAnyDragging(true);
    try { navigator.vibrate?.(18); } catch { /* ignore */ }
  }

  function handleDragEnd(event: DragEndEvent) {
    setAnyDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGroups((prev) => {
      const from = prev.findIndex((g) => g.slug === active.id);
      const to   = prev.findIndex((g) => g.slug === over.id);
      const next = arrayMove(prev, from, to);
      try {
        localStorage.setItem(ORDER_KEY, JSON.stringify(next.map((g) => g.slug)));
      } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groups.map((g) => g.slug)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {groups.map((group) => (
              <SortableCard key={group.slug} group={group} anyDragging={anyDragging} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-center text-[0.6rem] text-slate-600 pt-1">
        Hold &amp; drag to rearrange
      </p>
    </>
  );
}
