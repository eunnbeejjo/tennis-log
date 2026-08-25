import Link from "next/link";
import StringSetupForm from "@/components/StringSetupForm";

export default function NewStringSetupPage() {
  return (
    <div className="page">
      <Link
        href="/string-setups"
        className="text-sm font-semibold text-neutral-400"
      >
        ← 목록
      </Link>
      <h1 className="text-2xl font-bold text-neutral-900 mt-3 mb-6">
        스트링 세팅 추가
      </h1>
      <StringSetupForm />
    </div>
  );
}
