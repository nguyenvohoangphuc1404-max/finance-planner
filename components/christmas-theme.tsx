"use client";

import { useState } from "react";

const FLAKES = [
  { left: "6%", size: "14px", duration: "11s", delay: "0s" },
  { left: "16%", size: "18px", duration: "14s", delay: "2s" },
  { left: "28%", size: "12px", duration: "10s", delay: "4s" },
  { left: "42%", size: "16px", duration: "13s", delay: "1s" },
  { left: "56%", size: "14px", duration: "12s", delay: "3s" },
  { left: "68%", size: "18px", duration: "15s", delay: "5s" },
  { left: "80%", size: "13px", duration: "11s", delay: "2.5s" },
  { left: "92%", size: "16px", duration: "13.5s", delay: "0.5s" },
];

export function ChristmasTheme() {
  const [enabled, setEnabled] = useState(true);

  return (
    <>
      {enabled && (
        <div aria-hidden="true">
          {FLAKES.map((f, idx) => (
            <span
              key={idx}
              className="snowflake"
              style={{
                left: f.left,
                fontSize: f.size,
                animationDuration: f.duration,
                animationDelay: f.delay,
              }}
            >
              ❄
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 rounded-full border border-rose-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm backdrop-blur hover:bg-rose-50"
        title="Bật hoặc tắt hiệu ứng tuyết rơi Noel"
      >
        {enabled ? "🎄 Tắt tuyết" : "❄️ Bật tuyết"}
      </button>
    </>
  );
}