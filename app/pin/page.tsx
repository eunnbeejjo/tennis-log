"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@eunnbeejjo/ui";

export default function PinPage() {
  return (
    <Suspense fallback={null}>
      <PinForm />
    </Suspense>
  );
}

function PinForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(params.get("next") || "/");
      router.refresh();
    } else {
      setError("PIN이 올바르지 않아요.");
      setPin("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="flex flex-col items-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-court-light flex items-center justify-center text-2xl mb-4">
          🎾
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Tennizip
        </h1>
        <p className="text-sm text-neutral-400 mt-1.5">나만의 테니스 다이어리</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs flex flex-col items-center"
      >
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="flex gap-3"
          aria-label="PIN 입력"
        >
          {Array.from({ length: 4 }).map((_, i) => {
            const filled = i < pin.length;
            const active = focused && i === pin.length;
            return (
              <span
                key={i}
                className={`w-12 h-14 rounded-xl border flex items-center justify-center text-xl transition ${
                  filled
                    ? "border-court text-court"
                    : active
                    ? "border-court"
                    : "border-neutral-200 text-neutral-300"
                }`}
              >
                {filled ? "●" : ""}
              </span>
            );
          })}
        </button>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus
          className="sr-only"
        />

        {error && (
          <p className="text-sm text-red-500 text-center mt-4">{error}</p>
        )}

        <Button
          type="submit"
          isLoading={loading}
          disabled={pin.length < 4}
          className="w-full mt-8 rounded-xl bg-court hover:bg-court-dark active:bg-court-dark focus-visible:ring-court/40"
        >
          {loading ? "확인 중..." : "입장하기"}
        </Button>
      </form>
    </div>
  );
}
