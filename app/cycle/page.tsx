"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal, Spinner } from "@eunnbeejjo/ui";
import { supabase } from "@/lib/supabase";
import { CycleEntry } from "@/lib/types";
import { getAverageCycleLength, getCyclePhase, simplifyPhase } from "@/lib/cycle";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CyclePage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CycleEntry | null>(null);

  async function load() {
    const { data } = await supabase
      .from("cycle_entries")
      .select("*")
      .order("start_date", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("cycle_entries").insert({ start_date: date });
    setSaving(false);
    load();
  }

  function startEdit(entry: CycleEntry) {
    setEditingId(entry.id);
    setEditDate(entry.start_date);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDate("");
  }

  async function handleUpdate(id: string) {
    await supabase
      .from("cycle_entries")
      .update({ start_date: editDate })
      .eq("id", id);
    setEditingId(null);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await supabase.from("cycle_entries").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  const today = getCyclePhase(todayStr(), entries);
  const avgLength = getAverageCycleLength(entries);

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">생리주기</h1>

      <div className="bg-cycle-light border border-cycle/15 rounded-xl p-5 mb-6">
        <p className="text-sm text-neutral-500">오늘 기준</p>
        <p className="text-2xl font-bold text-cycle mt-1">
          {simplifyPhase(today.phase)}
          {today.dayInCycle && ` · 주기 ${today.dayInCycle}일차`}
        </p>
        <p className="text-xs text-neutral-400 mt-1.5">
          평균 주기 {avgLength}일 (기록 {entries.length}개 기준)
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-7">
        <div className="flex-1">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl focus-visible:ring-cycle/40"
          />
        </div>
        <Button
          type="submit"
          isLoading={saving}
          className="rounded-xl bg-cycle hover:bg-cycle active:bg-cycle focus-visible:ring-cycle/40"
        >
          시작일 추가
        </Button>
      </form>

      <h2 className="section-title">기록된 시작일</h2>
      {loading && (
        <div className="text-sm text-neutral-400 flex items-center gap-2">
          <Spinner size="sm" color="gray" /> 불러오는 중...
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {entries.map((entry) =>
          editingId === entry.id ? (
            <li key={entry.id} className="card px-3 py-2.5 flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="rounded-xl focus-visible:ring-cycle/40"
                  autoFocus
                />
              </div>
              <IconButton label="저장" onClick={() => handleUpdate(entry.id)}>
                <CheckIcon />
              </IconButton>
              <IconButton label="취소" onClick={cancelEdit}>
                <XIcon />
              </IconButton>
            </li>
          ) : (
            <li
              key={entry.id}
              className="card px-4 py-3 flex items-center justify-between text-sm text-neutral-600"
            >
              {entry.start_date}
              <div className="flex items-center gap-1">
                <IconButton label="수정" onClick={() => startEdit(entry)}>
                  <PencilIcon />
                </IconButton>
                <IconButton
                  label="삭제"
                  onClick={() => setDeleteTarget(entry)}
                  className="text-red-400 hover:text-red-500"
                >
                  <TrashIcon />
                </IconButton>
              </div>
            </li>
          )
        )}
      </ul>

      <Modal
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="기록을 삭제할까요?"
        description={
          deleteTarget ? `${deleteTarget.start_date} 시작일 기록이 삭제돼요.` : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg focus-visible:ring-court/40"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="rounded-lg"
            >
              삭제
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-500">삭제하면 되돌릴 수 없어요.</p>
      </Modal>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 transition ${className}`}
    >
      {children}
    </button>
  );
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-4 h-4",
};

function PencilIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L7 20l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M5 7h14" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M9 7V4.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
