"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/types";
import MatchForm from "@/components/MatchForm";

export default function EditMatchPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setMatch(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="page text-sm text-neutral-400">불러오는 중...</p>;
  }

  if (!match) {
    return (
      <p className="page text-sm text-neutral-400">
        기록을 찾을 수 없어요.
      </p>
    );
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        경기 기록 수정
      </h1>
      <MatchForm matchId={match.id} initial={match} />
    </div>
  );
}
