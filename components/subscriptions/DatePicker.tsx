// components/subscriptions/DatePicker.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string | null;                 // ISO or null
  onChange: (iso: string | null) => void;
  minDate?: Date;                       // default today
};

export default function DatePicker({ value, onChange, minDate }: Props) {
  const today = startOfDay(new Date());
  const min = startOfDay(minDate ?? today);

  // if no value provided, treat "selected" as today
  const selected = value ? new Date(value) : min;

  const [cursor, setCursor] = useState<Date>(startOfMonth(selected));
  const initRef = useRef(false);

  // One-time: if no incoming value, auto-select today
  useEffect(() => {
    if (!initRef.current && !value) {
      initRef.current = true;
      onChange(toLocalIsoDate(min));
    }
  }, [value, min, onChange]);

  const month = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const days = end.getDate();

    const firstDow = start.getDay();
    const cells: Array<{ day?: number; date?: Date; disabled?: boolean; selected?: boolean }> = [];

    for (let i = 0; i < firstDow; i++) cells.push({}); // leading blanks

    for (let d = 1; d <= days; d++) {
      const dt = new Date(start);
      dt.setDate(d);
      const isDisabled = dt < min;
      const isSelected =
        !!selected &&
        selected.getFullYear() === dt.getFullYear() &&
        selected.getMonth() === dt.getMonth() &&
        selected.getDate() === dt.getDate();

      cells.push({ day: d, date: dt, disabled: isDisabled, selected: isSelected });
    }

    const rows: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cursor, selected, min]);

  const canPrev = () => startOfMonth(addMonths(cursor, -1)) >= startOfMonth(min);

  function selectDate(dt: Date) {
    if (dt < min) return;
    onChange(toLocalIsoDate(dt)); // midnight local -> ISO
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev() && setCursor(addMonths(cursor, -1))}
          disabled={!canPrev()}
          className="rounded-md border border-white/15 px-2 py-1 text-sm hover:bg-white/[0.07] disabled:opacity-40"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-semibold">
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="rounded-md border border-white/15 px-2 py-1 text-sm hover:bg-white/[0.07]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-white/70">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {month.map((row, i) => (
          <div key={i} className="contents">
            {row.map((c, j) =>
              c.day ? (
                <button
                  key={j}
                  type="button"
                  disabled={c.disabled}
                  onClick={() => c.date && selectDate(c.date)}
                  className={[
                    "h-8 rounded-md text-sm",
                    c.disabled
                      ? "opacity-40 cursor-not-allowed border border-transparent"
                      : "hover:bg-white/[0.10] border border-white/10",
                    c.selected ? "bg-emerald-500/20 border-emerald-400/40" : "bg-white/[0.06]",
                  ].join(" ")}
                >
                  {c.day}
                </button>
              ) : (
                <div key={j} />
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/70">
        <div>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/80 align-middle" /> Selected
        </div>
        <div>Min: {min.toLocaleDateString()}</div>
      </div>
    </div>
  );
}

/* utils */
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d: Date) { const x = startOfMonth(addMonths(d,1)); x.setDate(0); return x; }
function addMonths(d: Date, delta: number) { const x = new Date(d); x.setMonth(x.getMonth()+delta); return x; }
/** Serialize a local calendar day as **noon UTC** to avoid off-by-one in all timezones. */
function toLocalIsoDate(d: Date) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  // noon UTC ensures it won't roll back/forward a day in any TZ
  const utcNoon = new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), 12, 0, 0, 0));
  return utcNoon.toISOString();
}
