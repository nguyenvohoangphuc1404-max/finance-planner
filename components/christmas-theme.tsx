"use client";

import { useState } from "react";

const FLAKES = [
  { left: "4%", size: "15px", duration: "10s", delay: "0s" },
  { left: "12%", size: "20px", duration: "13s", delay: "1.5s" },
  { left: "21%", size: "13px", duration: "9.5s", delay: "3s" },
  { left: "30%", size: "18px", duration: "12s", delay: "0.5s" },
  { left: "39%", size: "14px", duration: "11s", delay: "4s" },
  { left: "48%", size: "21px", duration: "14s", delay: "2s" },
  { left: "57%", size: "13px", duration: "10.5s", delay: "5s" },
  { left: "66%", size: "19px", duration: "13.5s", delay: "1s" },
  { left: "75%", size: "15px", duration: "11.5s", delay: "3.5s" },
  { left: "84%", size: "20px", duration: "12.5s", delay: "2.5s" },
  { left: "93%", size: "14px", duration: "10s", delay: "4.5s" },
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
        className="fixed bottom-4 right-4 z-50 rounded-full border border-amber-300/60 bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-rose-600 transition"
        title="Bật hoặc tắt hiệu ứng tuyết rơi Noel"
      >
        {enabled ? "🎄 Tắt tuyết Noel" : "❄️ Bật tuyết Noel"}
      </button>
    </>
  );
}