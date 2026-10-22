import React from "react";

export default function PlayerHUD({ playerState, onOpenArmory }) {
  if (!playerState) return null;

  const {
    hp = 100,
    maxHp = 100,
    armor = 100,
    maxArmor = 100,
    credits = 120,
    speedBuff = false,
    overdriveBuff = false,
    dashCooldown = 0,
    maxDashCooldown = 165,
    dashReady = true,
    turretCount = 0,
    activeTurrets = 0,
    maxTurrets = 4
  } = playerState;

  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const armorPct = Math.max(0, Math.min(100, (armor / maxArmor) * 100));
  const dashPct = Math.max(0, Math.min(100, ((maxDashCooldown - dashCooldown) / maxDashCooldown) * 100));

  return (
    <div className="pointer-events-none absolute top-3 left-3 z-40 flex flex-col gap-1.5 select-none font-mono-tech w-60">
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-2.5 shadow-xl flex flex-col gap-2">
        {/* Credits / Ví Tiền Riêng */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            VÍ TIỀN RIÊNG
          </span>
          <span className="text-sm font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            ${credits.toLocaleString("vi-VN")}
          </span>
        </div>

        {/* Máu (HP) */}
        <div>
          <div className="flex justify-between text-[9px] font-bold text-rose-300 mb-0.5">
            <span>MÁU (HP)</span>
            <span>{Math.ceil(hp)} / {maxHp}</span>
          </div>
          <div className="w-full h-2 bg-slate-900 border border-rose-500/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-150"
              style={{ width: `${hpPct}%` }}
            ></div>
          </div>
        </div>

        {/* Giáp Nano */}
        <div>
          <div className="flex justify-between text-[9px] font-bold text-sky-300 mb-0.5">
            <span>GIÁP NANO</span>
            <span>{Math.ceil(armor)} / {maxArmor}</span>
          </div>
          <div className="w-full h-2 bg-slate-900 border border-sky-500/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-150"
              style={{ width: `${armorPct}%` }}
            ></div>
          </div>
        </div>

        {/* Tactical Skills: Jetpack Dash [SPACE] & Turrets [T] */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {/* Dash Indicator */}
          <div className="bg-slate-900/80 border border-cyan-500/30 p-1 flex flex-col gap-0.5">
            <div className="flex justify-between items-center text-[8.5px] font-bold">
              <span className="text-cyan-300">LƯỚT [SPACE]</span>
              <span className={dashReady ? "text-emerald-400" : "text-amber-400"}>
                {dashReady ? "SẴN SÀNG" : `${(dashCooldown / 60).toFixed(1)}s`}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  dashReady ? "bg-cyan-400" : "bg-amber-400"
                }`}
                style={{ width: `${dashPct}%` }}
              ></div>
            </div>
          </div>

          {/* Turret Indicator */}
          <div className="bg-slate-900/80 border border-emerald-500/30 p-1 flex flex-col gap-0.5">
            <div className="flex justify-between items-center text-[8.5px] font-bold">
              <span className="text-emerald-300">THÁP PHÁO [T]</span>
              <span className="text-amber-300 font-mono-tech">
                {turretCount} kho
              </span>
            </div>
            <div className="text-[7.5px] text-slate-400 text-right">
              ĐÃ ĐẶT: <span className="text-emerald-400 font-bold">{activeTurrets}/{maxTurrets}</span>
            </div>
          </div>
        </div>

        {/* Active Buffs */}
        {(speedBuff || overdriveBuff) && (
          <div className="flex gap-1.5 mt-0.5">
            {speedBuff && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                ⚡ TĂNG TỐC
              </span>
            )}
            {overdriveBuff && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse">
                🔥 X2 CUỒNG NỘ
              </span>
            )}
          </div>
        )}

        {/* Armory Shop Quick Access Button */}
        {onOpenArmory && (
          <button
            onClick={onOpenArmory}
            className="pointer-events-auto mt-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-[10px] flex items-center justify-between transition cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            title="Mở Kho Vũ Khí [Phím B]"
          >
            <span className="flex items-center gap-1.5">
              <span className="px-1 bg-emerald-500/30 border border-emerald-400/50 text-white text-[8.5px]">B</span>
              <span>KHO VŨ KHÍ</span>
            </span>
            <span className="text-amber-300 font-black">${credits.toLocaleString("vi-VN")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
