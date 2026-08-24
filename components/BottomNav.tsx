"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/matches", label: "경기", icon: "🎾" },
  { href: "/string-setups", label: "스트링", icon: "🎼" },
  { href: "/cycle", label: "주기", icon: "🌙" },
  { href: "/dashboard", label: "분석", icon: "📊" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // PIN 화면에서는 네비게이션 숨김
  if (pathname === "/pin") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-neutral-200 flex">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              active ? "text-court" : "text-neutral-400"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
