// components/marketing/Subnav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export default function Subnav() {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <nav className="mx-auto mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm backdrop-blur">
        <ul className="flex items-center justify-center gap-6">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`rounded-md px-2 py-1 transition ${active ? "text-white" : "text-white/75 hover:text-white"}`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
