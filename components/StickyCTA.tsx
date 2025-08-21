'use client';
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function StickyCTA({ heroCtaId }: { heroCtaId: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = document.getElementById(heroCtaId);
    if (!target) return;
    const onScroll = () => setShow(window.scrollY > 120);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting;
        if (visible) setShow(false);
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0.01 }
    );
    io.observe(target);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroCtaId]);

  return (
    <div
      ref={ref}
      className={`fixed inset-x-0 bottom-4 z-40 hidden justify-center md:flex transition ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/90 p-2 text-gray-900 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <span className="hidden px-2 text-sm text-gray-700 md:inline">Never run out again.</span>
        <Link
          href="/pricing"
          onClick={() => (window as any).gtag?.("event","cta_click",{ label:"sticky_start_plan" })}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Start your plan
        </Link>
        <Link href="#how-it-works" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          See how it works
        </Link>
      </div>
    </div>
  );
}
