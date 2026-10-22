import React from "react";

export default function WeaponDock({ weaponState, onSelectWeapon }) {
  if (!weaponState || !weaponState.weapons) return null;

  const { currentWeapon, weapons } = weaponState;

  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-3 flex flex-col items-center gap-1.5 select-none">
      {/* Keyboard Quick Guide */}
      <div className="pointer-events-auto px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono-tech text-slate-300 hidden sm:flex items-center gap-3 shadow-lg">
        <span><b className="text-emerald-400">[WASD]</b> Di chuyển</span>
        <span className="text-slate-600">•</span>
        <span><b className="text-cyan-400">[1-7]</b> Đổi Súng ([7] Laze)</span>
        <span className="text-slate-600">•</span>
        <span><b className="text-amber-400">[Chuột Trái]</b> Khai Hỏa</span>
        <span className="text-slate-600">•</span>
        <span><b className="text-purple-400">[Lăn Chuột]</b> Đổi Vũ Khí Nhanh</span>
      </div>

      {/* 7-Slot Weapon Grid */}
      <div className="pointer-events-auto grid grid-cols-4 sm:grid-cols-7 gap-1.5 w-full">
        {weapons.map((w, idx) => {
          const isActive = currentWeapon === idx;
          const isLocked = !w.unlocked;
          const isOutOfAmmo = w.ammo === 0;

          return (
            <button
              key={w.id}
              onClick={() => onSelectWeapon(idx)}
              className={`relative flex flex-col p-2 text-left border transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-b from-emerald-950/80 via-slate-900/90 to-slate-950/95 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] -translate-y-1"
                  : isLocked
                  ? "bg-slate-950/60 border-slate-800/80 opacity-50 hover:opacity-75"
                  : isOutOfAmmo
                  ? "bg-rose-950/30 border-rose-900/60 hover:border-rose-500"
                  : "bg-slate-950/80 hover:bg-slate-900/90 border-slate-700/80 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`px-1.5 py-0.2 rounded-none text-[9px] font-mono-tech font-extrabold border ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-700"
                  }`}
                >
                  [{w.key}]
                </span>

                {/* Weapon Icon Thumbnail */}
                <div className="h-6 w-12 flex items-center justify-end overflow-hidden">
                  <img
                    src={w.icon}
                    alt={w.shortName}
                    className="max-h-6 max-w-full object-contain filter drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>

              <div className="mt-1 min-w-0">
                <div
                  className={`text-[11px] font-extrabold truncate ${
                    isActive ? "text-emerald-200" : "text-slate-200"
                  }`}
                >
                  {w.shortName}
                </div>

                <div className="text-[9px] font-mono-tech mt-0.5">
                  {isLocked ? (
                    <span className="text-slate-500 font-bold">🔒 KHÓA</span>
                  ) : w.ammo === Infinity ? (
                    <span className="text-emerald-400 font-bold">VÔ HẠN (INF)</span>
                  ) : isOutOfAmmo ? (
                    <span className="text-rose-400 font-bold animate-pulse">0 / {w.maxAmmo}</span>
                  ) : (
                    <span className={isActive ? "text-amber-300 font-bold" : "text-slate-400"}>
                      {w.ammo} / {w.maxAmmo}
                    </span>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

