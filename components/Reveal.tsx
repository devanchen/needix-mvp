"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wrap content with <Reveal> to animate it the first time it scrolls into view.
 * Props:
 *  - delay (ms, optional)
 *  - y (px translate distance, default 16)
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700",
        shown ? "opacity-100 translate-y-0" : `opacity-0 translate-y-[${y}px]`,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
