"use client";

import { ReactNode } from "react";

type BadgeStripProps = {
  children: ReactNode;                 // usually a set of <CtaBadge> items
  theme?: "light" | "dark" | "gradient";
  className?: string;                  // container
  innerClassName?: string;             // the row wrapper
  title?: string;                      // optional small headline above badges
  titleClassName?: string;
  divider?: boolean;                   // show subtle top/bottom borders
};

export default function BadgeStrip({
  children,
  theme = "light",
  className = "",
  innerClassName = "",
  title,
  titleClassName = "",
  divider = true,
}: BadgeStripProps) {
  const themes = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-950 text-white",
    gradient: "bg-gradient-to-r from-zinc-900 via-black to-zinc-900 text-white",
  };

  const borders =
    divider
      ? theme === "light"
        ? "border-y border-black/5"
        : "border-y border-white/10"
      : "";

  return (
    <section className={`py-4 ${themes[theme]} ${borders} ${className}`}>
      <div className="mx-auto max-w-6xl px-4">
        {title ? (
          <div className={`mb-3 text-center text-xs uppercase tracking-wide opacity-70 ${titleClassName}`}>
            {title}
          </div>
        ) : null}

        <div
          className={`flex flex-wrap items-center justify-center gap-2 ${innerClassName}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
