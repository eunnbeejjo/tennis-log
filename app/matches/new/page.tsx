import MatchForm from "@/components/MatchForm";

export default function NewMatchPage() {
  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        경기 기록 추가
      </h1>
      <MatchForm />
    </div>
  );
}
