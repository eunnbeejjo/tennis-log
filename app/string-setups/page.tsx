"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StringSetup } from "@/lib/types";

export default function StringSetupsPage() {
  const [setups, setSetups] = useState<StringSetup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("string_setups")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSetups(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">스트링 세팅</h1>
        <Link href="/string-setups/new" className="btn-pill">
          + 추가
        </Link>
      </div>

      {loading && <p className="text-sm text-neutral-400">불러오는 중...</p>}
      {!loading && setups.length === 0 && (
        <p className="text-sm text-neutral-400">
          아직 등록된 세팅이 없어요.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {setups.map((s) => (
          <li key={s.id} className="card p-4">
            <p className="font-bold text-neutral-800">{s.racket_name}</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              {s.string_type} · {s.tension ?? "-"}lbs
            </p>
            {s.strung_date && (
              <p className="text-xs text-neutral-400 mt-1">
                장착일: {s.strung_date}
              </p>
            )}
            {s.feel_note && (
              <p className="text-sm text-neutral-600 mt-2.5">
                {s.feel_note}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
