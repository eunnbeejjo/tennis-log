"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/matches", label: "경기", Icon: TrophyIcon },
  { href: "/string-setups", label: "스트링", Icon: StringIcon },
  { href: "/cycle", label: "주기", Icon: MoonIcon },
  { href: "/dashboard", label: "분석", Icon: ChartIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  // PIN 화면에서는 네비게이션 숨김
  if (pathname === "/pin") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-neutral-200 flex">
      {TABS.map(({ href, label, Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              active ? "text-court" : "text-neutral-400"
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-5 h-5",
};

function HomeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10.2V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-8.8" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 7 9.5" />
      <path d="M17 5h2.5A2.5 2.5 0 0 1 17 9.5" />
      <line x1="12" y1="13" x2="12" y2="17" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="17" x2="12" y2="20" />
    </svg>
  );
}

function StringIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <line x1="4" y1="9.3" x2="20" y2="9.3" />
      <line x1="4" y1="14.7" x2="20" y2="14.7" />
      <line x1="9.3" y1="4" x2="9.3" y2="20" />
      <line x1="14.7" y1="4" x2="14.7" y2="20" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg {...ICON_PROPS}>
      <line x1="5" y1="20" x2="5" y2="11" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="19" y1="20" x2="19" y2="14" />
    </svg>
  );
}
