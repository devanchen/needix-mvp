"use client";

import { Check } from "lucide-react";
import { ReactNode } from "react";

type CtaBadgeProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export default function CtaBadge({
  children,
  icon = <Check className="h-4 w-4 text-green-500" />,
  className = "",
}: CtaBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 shadow-sm ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
