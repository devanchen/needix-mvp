'use client';
import React from "react";

export default function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-gray-100">Close</button>
        </div>
        <div className="mt-3 text-sm text-gray-700">{children}</div>
      </div>
    </div>
  );
}
