import React from "react";

export default function BossHUD({ bossSquadState }) {
  if (!bossSquadState || !bossSquadState.active || bossSquadState.totalBosses === 0) {
    return null;
  }

  const {
    title,
    aliveCount,
    totalBosses,
    totalHp,
    maxHp,
    totalShield,
    hasEnraged,
    statusText
  } = bossSquadState;

  if (aliveCount <= 0) return null;

  const hpPct = Math.max(0, Math.min(100, (totalHp / Math.max(1, maxHp)) * 100));

  return (
    <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-3 select-none">
      <div className="bg-slate-950/90 backdrop-blur-md border border-rose-500/70 p-3 shadow-[0_0_25px_rgba(244,63,94,0.35)] flex flex-col gap-1.5">
        {/* Header Title & Badge */}
        <div className="flex items-center justify-between text-[11px] font-mono-tech">
          <div className="flex items-center gap-2 font-black text-rose-400 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
            <span className="truncate uppercase tracking-wider">{title}</span>
          </div>

          <span
            className={`px-2 py-0.5 text-[10px] font-mono-tech font-black shrink-0 border ${
              hasEnraged
                ? "bg-rose-950 text-rose-300 border-rose-500/80 animate-pulse"
                : "bg-slate-900 text-amber-300 border-amber-500/40"
            }`}
          >
            {hasEnraged
              ? `⚡ CUỒNG NỘ // TRÙM: ${aliveCount}/${totalBosses}`
              : `TRÙM CÒN: ${aliveCount}/${totalBosses}`}
          </span>
        </div>

        {/* Health Bar */}
        <div className="relative w-full h-3 bg-slate-900 border border-rose-500/40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-700 via-red-500 to-amber-400 transition-all duration-150"
            style={{ width: `${hpPct}%` }}
          ></div>

          {/* Shield Overlay */}
          {totalShield > 0 && (
            <div
              className="absolute inset-y-0 left-0 bg-cyan-400/50 border-r-2 border-cyan-300"
              style={{ width: `${Math.min(100, (totalShield / maxHp) * 100)}%` }}
            ></div>
          )}
        </div>

        {/* HP Numbers & Status */}
        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-300">
          <span className="text-amber-300 font-bold truncate">
            {statusText || "Đang truy sát mục tiêu..."}
          </span>
          <span className="font-extrabold text-rose-200 shrink-0 ml-2">
            {Math.ceil(totalHp).toLocaleString("vi-VN")}
            {totalShield > 0 && (
              <span className="text-cyan-300">
                {" "}(+{Math.ceil(totalShield).toLocaleString("vi-VN")} Giáp)
              </span>
            )}
            {" / "}
            {maxHp.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </div>
  );
}

