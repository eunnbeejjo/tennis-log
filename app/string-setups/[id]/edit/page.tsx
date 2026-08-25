"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StringSetup } from "@/lib/types";
import StringSetupForm from "@/components/StringSetupForm";

export default function EditStringSetupPage() {
  const { id } = useParams<{ id: string }>();
  const [setup, setSetup] = useState<StringSetup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("string_setups")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setSetup(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="page text-sm text-neutral-400">불러오는 중...</p>;
  }

  if (!setup) {
    return (
      <div className="page">
        <p className="text-sm text-neutral-400 mb-4">
          세팅을 찾을 수 없어요.
        </p>
        <Link
          href="/string-setups"
          className="text-sm font-semibold text-court"
        >
          ← 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link
        href="/string-setups"
        className="text-sm font-semibold text-neutral-400"
      >
        ← 목록
      </Link>
      <h1 className="text-2xl font-bold text-neutral-900 mt-3 mb-6">
        스트링 세팅 수정
      </h1>
      <StringSetupForm setupId={setup.id} initial={setup} />
    </div>
  );
}
