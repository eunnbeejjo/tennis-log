"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@eunnbeejjo/ui";
import { supabase } from "@/lib/supabase";
import { StringSetup } from "@/lib/types";

interface FormState {
  racket_name: string;
  main_string_type: string;
  cross_string_type: string;
  sameTension: boolean;
  main_tension: string;
  cross_tension: string;
  strung_date: string;
  feel_note: string;
}

function toFormState(s?: StringSetup): FormState {
  const mainTension = s?.main_tension ?? s?.tension ?? null;
  const crossTension = s?.cross_tension ?? null;
  const sameTension = crossTension == null || crossTension === mainTension;
  return {
    racket_name: s?.racket_name || "",
    main_string_type: s?.main_string_type || s?.string_type || "",
    cross_string_type: s?.cross_string_type || "",
    sameTension,
    main_tension: mainTension != null ? String(mainTension) : "",
    cross_tension:
      !sameTension && crossTension != null ? String(crossTension) : "",
    strung_date: s?.strung_date || new Date().toISOString().slice(0, 10),
    feel_note: s?.feel_note || "",
  };
}

const inputStyle = "rounded-xl focus-visible:ring-court/40";

export default function StringSetupForm({
  setupId,
  initial,
}: {
  setupId?: string;
  initial?: StringSetup;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(toFormState(initial));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const mainTension = form.main_tension ? Number(form.main_tension) : null;
    const crossTension = form.sameTension
      ? mainTension
      : form.cross_tension
      ? Number(form.cross_tension)
      : null;

    const payload = {
      racket_name: form.racket_name,
      main_string_type: form.main_string_type,
      cross_string_type: form.cross_string_type || null,
      main_tension: mainTension,
      cross_tension: crossTension,
      strung_date: form.strung_date || null,
      feel_note: form.feel_note || null,
    };

    const { error } = setupId
      ? await supabase.from("string_setups").update(payload).eq("id", setupId)
      : await supabase.from("string_setups").insert(payload);

    setSaving(false);

    if (error) {
      setError("저장에 실패했어요.");
      return;
    }
    router.push("/string-setups");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="라켓 이름"
        value={form.racket_name}
        onChange={(e) => setForm({ ...form, racket_name: e.target.value })}
        placeholder="예: 윌슨 블레이드 98"
        className={inputStyle}
      />

      <Field label="스트링 종류">
        <div className="flex flex-col gap-2">
          <Input
            value={form.main_string_type}
            onChange={(e) =>
              setForm({ ...form, main_string_type: e.target.value })
            }
            placeholder="세로(메인) · 예: 루키올 엑스텐션"
            className={inputStyle}
          />
          <Input
            value={form.cross_string_type}
            onChange={(e) =>
              setForm({ ...form, cross_string_type: e.target.value })
            }
            placeholder="가로(크로스) · 하이브리드가 아니면 비워두세요"
            className={inputStyle}
          />
        </div>
      </Field>

      <Field label="텐션 (lbs)">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={form.sameTension}
              onChange={(e) =>
                setForm({ ...form, sameTension: e.target.checked })
              }
              className="w-4 h-4 accent-court"
            />
            가로/세로 동일
          </label>

          {form.sameTension ? (
            <Input
              type="number"
              value={form.main_tension}
              onChange={(e) =>
                setForm({ ...form, main_tension: e.target.value })
              }
              placeholder="예: 50"
              className={inputStyle}
            />
          ) : (
            <div className="flex gap-2">
              <Input
                label="세로(메인)"
                type="number"
                value={form.main_tension}
                onChange={(e) =>
                  setForm({ ...form, main_tension: e.target.value })
                }
                placeholder="예: 50"
                className={inputStyle}
              />
              <Input
                label="가로(크로스)"
                type="number"
                value={form.cross_tension}
                onChange={(e) =>
                  setForm({ ...form, cross_tension: e.target.value })
                }
                placeholder="예: 48"
                className={inputStyle}
              />
            </div>
          )}
        </div>
      </Field>

      <Input
        type="date"
        label="장착일"
        value={form.strung_date}
        onChange={(e) => setForm({ ...form, strung_date: e.target.value })}
        className={inputStyle}
      />

      <Field label="체감 메모">
        <textarea
          className="input resize-none"
          rows={3}
          value={form.feel_note}
          onChange={(e) => setForm({ ...form, feel_note: e.target.value })}
          placeholder="파워/컨트롤/타구감 등 자유롭게"
        />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        isLoading={saving}
        className="mt-1 rounded-xl bg-court hover:bg-court-dark active:bg-court-dark focus-visible:ring-court/40"
      >
        {saving ? "저장 중..." : setupId ? "수정 완료" : "저장하기"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-500">{label}</label>
      {children}
    </div>
  );
}
