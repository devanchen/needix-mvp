'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["home","features","how-it-works","pricing","faq"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setActive(id)),
        { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const linkCls = (id: string) =>
    `rounded-lg px-3 py-1.5 text-sm transition ${active === id ? "bg-white/10 text-white" : "text-white/80 hover:text-white"}`;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 ${scrolled ? "border-b border-white/10" : ""}`}>
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-all ${scrolled ? "h-14" : "h-16"}`}>
        <Link href="/" className="font-bold tracking-tight">Needix<span className="text-red-400">.</span></Link>
        <nav className="hidden gap-1 md:flex">
          <a href="#features" className={linkCls("features")}>Features</a>
          <a href="#how-it-works" className={linkCls("how-it-works")}>How it works</a>
          <a href="#pricing" className={linkCls("pricing")}>Pricing</a>
          <a href="#faq" className={linkCls("faq")}>FAQ</a>
        </nav>
        <Link href="/pricing" className="hidden rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:opacity-90 md:inline-flex">
          Start your plan
        </Link>
      </div>
    </header>
  );
}
