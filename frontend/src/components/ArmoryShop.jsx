import React, { useState, useEffect } from "react";

export default function ArmoryShop({
  armoryData,
  onBuyUpgrade,
  onBuyOrRefillWeapon,
  onClose
}) {
  const [feedback, setFeedback] = useState(null);

  // Close on ESC hotkey (KeyB is toggled by engine.onToggleArmory)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!armoryData) return null;

  const { player, weapons } = armoryData;
  const credits = player.credits || 0;
  const hp = Math.ceil(player.hp || 0);
  const maxHp = player.maxHp || 100;
  const armor = Math.ceil(player.armor || 0);
  const maxArmor = player.maxArmor || 100;
  const dmgMult = player.damageMultiplier || 1.0;

  const showToast = (title, msg, isError = false) => {
    setFeedback({ title, msg, isError });
    setTimeout(() => {
      setFeedback(null);
    }, 2800);
  };

  const handleWeaponClick = (w) => {
    const res = onBuyOrRefillWeapon(w.id);
    if (res) {
      showToast(res.success ? "THÀNH CÔNG" : "KHÔNG THỂ THỰC HIỆN", res.reason, !res.success);
    }
  };

  const handleUpgradeClick = (type) => {
    const res = onBuyUpgrade(type);
    if (res) {
      showToast(res.success ? "NÂNG CẤP THÀNH CÔNG" : "KHÔNG THỂ NÂNG CẤP", res.reason, !res.success);
    }
  };

  // Upgrade costs calculation
  const vitalLvl = Math.max(0, (player.vitalLevel || 1) - 1);
  const costMaxHp = vitalLvl >= 5 ? 0 : Math.round(300 * Math.pow(1.45, vitalLvl));

  const speedLvl = Math.max(0, (player.speedLevel || 1) - 1);
  const costSpeed = speedLvl >= 5 ? 0 : Math.round(280 * Math.pow(1.48, speedLvl));

  const dmgLvl = Math.max(0, (player.dmgLevel || 1) - 1);
  const costDamage = dmgLvl >= 5 ? 0 : Math.round(420 * Math.pow(1.52, dmgLvl));

  const healCount = player.healCount || 0;
  const costHeal = healCount >= 5 ? 0 : 140 + healCount * 35;

  const droneCount = player.droneCount || 0;
  const costDrone = droneCount >= 3 ? 0 : Math.round(650 * Math.pow(1.6, droneCount));

  const turretCount = player.turretCount || 0;
  const costTurret = turretCount >= 4 ? 0 : 350;

  const costNvg = 420;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-mono-tech">
      <div
        className="w-[96vw] sm:w-[92vw] xl:max-w-[1140px] max-h-[88vh] flex flex-col border border-emerald-500/50 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden"
        style={{
          background: "rgba(7, 11, 20, 0.96)",
          backdropFilter: "blur(16px)"
        }}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-xs shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              B
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
                TRẠM VŨ KHÍ &amp; NÂNG CẤP CHIẾN THUẬT
              </h2>
              <p className="text-[10px] text-slate-400">
                Mở khóa súng hạng nặng [Phím 1-7], nạp đạn và cường hóa giáp / hỏa lực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-slate-950/90 border border-slate-800 text-[10px]">
              <span className="text-rose-400 font-bold">
                MÁU: <b className="text-white">{hp}/{maxHp}</b>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-400 font-bold">
                GIÁP: <b className="text-white">{armor}/{maxArmor}</b>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-amber-300 font-bold">
                SÁT THƯƠNG: <b className="text-white">x{dmgMult.toFixed(2)}</b>
              </span>
            </div>

            <div className="px-3.5 py-1.5 bg-amber-950/80 border border-amber-500/40 font-extrabold text-amber-300 text-xs shadow-[0_0_12px_rgba(251,191,36,0.25)]">
              ${credits.toLocaleString("vi-VN")}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition shadow cursor-pointer active:scale-95"
            >
              ĐÓNG [B / ESC]
            </button>
          </div>
        </div>

        {/* Live Feedback Toast Notification */}
        {feedback && (
          <div
            className={`px-4 py-2 border-b text-xs flex items-center justify-between transition-all ${
              feedback.isError
                ? "bg-rose-950/90 border-rose-500/50 text-rose-300"
                : "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
            }`}
          >
            <span className="font-extrabold uppercase tracking-wide">
              [{feedback.title}] {feedback.msg}
            </span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Responsive Body */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
          {/* LEFT COLUMN: 7 WEAPONS */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/90 pb-1.5">
              <h3 className="text-[11px] uppercase tracking-wider text-emerald-400 font-black">
                1. KHO VŨ KHÍ TÁC CHIẾN (PHÍM 1 – 7)
              </h3>
              <span className="text-[10px] text-slate-400">
                Click thẻ để Mở khóa / Nạp đạn / Trang bị
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 content-start">
              {weapons.map((w) => {
                const isCurrent = w.isCurrent;
                const isLaserUltimate = w.id === 6;
                const rCost = w.refillCost || 90;
                const isFullAmmo = w.ammo === Infinity || w.ammo >= w.maxAmmo;

                let btnLabel = "";
                let btnClass = "";

                if (!w.unlocked) {
                  btnLabel = `Mở Khóa ($${w.cost})`;
                  btnClass =
                    credits >= w.cost
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border border-emerald-400"
                      : "bg-slate-800 text-slate-400 border border-slate-700 opacity-60";
                } else if (!isFullAmmo) {
                  btnLabel = `Nạp Đạn ($${rCost})`;
                  btnClass =
                    credits >= rCost
                      ? "bg-sky-500 hover:bg-sky-400 text-slate-950 font-black border border-sky-400"
                      : "bg-slate-800 text-slate-400 border border-slate-700 opacity-60";
                } else if (isCurrent) {
                  btnLabel = w.ammo === Infinity ? "Đạn Vô Hạn" : "Đang Dùng";
                  btnClass = "bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold";
                } else {
                  btnLabel = "Trang Bị";
                  btnClass = "bg-slate-800 hover:bg-slate-700 border border-emerald-400/40 text-emerald-300 font-bold";
                }

                const borderClass = isCurrent
                  ? "border-emerald-400 bg-emerald-950/35 shadow-[0_0_18px_rgba(16,185,129,0.22)]"
                  : isLaserUltimate
                  ? "border-fuchsia-500/50 bg-gradient-to-r from-slate-900/95 via-fuchsia-950/25 to-slate-900/95 hover:border-fuchsia-400"
                  : "border-slate-700/80 bg-slate-900/90 hover:border-slate-500";

                const ammoStr = w.ammo === Infinity ? "∞" : `${w.ammo}/${w.maxAmmo}`;
                const dmgStr =
                  w.type === "laser"
                    ? `ST: ${w.damage}-${Math.round(w.damage * 1.85)}/nhịp`
                    : `ST: ${w.damage}${w.pellets > 1 ? `×${w.pellets}` : ""}`;

                return (
                  <div
                    key={w.id}
                    onClick={() => handleWeaponClick(w)}
                    className={`${isLaserUltimate ? "sm:col-span-2" : ""} h-[88px] px-3.5 py-2 border ${borderClass} flex flex-col justify-between transition cursor-pointer hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-1.5 py-0.5 bg-slate-950 text-emerald-400 font-extrabold text-[9.5px] border border-slate-700/80 shrink-0">
                          [{w.key}]
                        </span>
                        <span
                          className="text-xs font-extrabold text-white truncate uppercase tracking-tight"
                          title={w.name}
                        >
                          {w.name}
                        </span>
                        {isLaserUltimate && (
                          <span className="hidden sm:inline-block px-1.5 py-0.5 bg-fuchsia-500/15 border border-fuchsia-400/35 text-[9px] font-bold text-fuchsia-300 shrink-0 uppercase">
                            SIÊU VŨ KHÍ TÍCH NHIỆT
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 h-7 w-16 flex items-center justify-end">
                        <img
                          src={w.altIcon || w.icon}
                          alt={w.name}
                          className="max-h-7 max-w-full object-contain filter drop-shadow"
                          onError={(e) => {
                            if (w.icon && e.target.src !== w.icon) {
                              e.target.src = w.icon;
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/70 min-w-0">
                      <div className="text-[9.5px] text-slate-300 whitespace-nowrap min-w-0">
                        <span className="text-amber-300 font-bold">{dmgStr}</span>
                        <span className="text-slate-600 mx-1">|</span>
                        <span className="text-slate-400">Đạn:</span>{" "}
                        <b
                          className={
                            w.ammo === 0 ? "text-rose-400" : "text-emerald-300"
                          }
                        >
                          {ammoStr}
                        </b>
                      </div>
                      <span
                        className={`px-2 py-0.5 ${btnClass} font-extrabold text-[9.5px] sm:text-[10px] transition shrink-0 uppercase tracking-tight whitespace-nowrap shadow-sm`}
                      >
                        {btnLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: 7 UPGRADES */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/90 pb-1.5">
              <h3 className="text-[11px] uppercase tracking-wider text-emerald-400 font-black">
                2. NÂNG CẤP CHỈ SỐ &amp; TRỢ CHIẾN
              </h3>
              <span className="text-[10px] text-slate-400">
                Tối đa 5 cấp / chỉ số
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 flex-1 content-start">
              {/* 1. Heal */}
              <button
                onClick={() => handleUpgradeClick("heal")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-rose-400 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/hp.png"
                      alt="Hồi HP"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-rose-200 truncate group-hover:text-white">
                      Hồi Đầy 100% Máu &amp; Giáp ({healCount}/5)
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Phục hồi tức thì toàn bộ HP &amp; Giáp Nano
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {healCount >= 5 ? "MAX" : `$${costHeal}`}
                </span>
              </button>

              {/* 2. Max HP & Armor */}
              <button
                onClick={() => handleUpgradeClick("maxhp")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-emerald-400 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/tang_mau_giap.png"
                      alt="Tăng Máu Giáp"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-emerald-200 truncate group-hover:text-white">
                      Tăng Giới Hạn Máu &amp; Giáp (+30)
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Cấp độ: <b className="text-emerald-300">{vitalLvl}/5</b> • +30 HP &amp; +30 Giáp
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {vitalLvl >= 5 ? "MAX" : `$${costMaxHp}`}
                </span>
              </button>

              {/* 3. Speed */}
              <button
                onClick={() => handleUpgradeClick("speed")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-yellow-400 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/tang_toc_chay.png"
                      alt="Giày Phản Lực"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-yellow-200 truncate group-hover:text-white">
                      Giày Phản Lực (+8% Tốc chạy)
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Cấp độ: <b className="text-yellow-300">{speedLvl}/5</b> • Tăng tốc độ né tránh
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {speedLvl >= 5 ? "MAX" : `$${costSpeed}`}
                </span>
              </button>

              {/* 4. Damage & Ammo */}
              <button
                onClick={() => handleUpgradeClick("damage")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-orange-400 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/tang_dame.png"
                      alt="Đạn Nhiệt Hạch"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-orange-200 truncate group-hover:text-white">
                      Đạn Nhiệt Hạch (+20% ST &amp; +50 Đạn)
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Cấp độ: <b className="text-orange-300">{dmgLvl}/5</b> • +50 Max Đạn mọi súng
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {dmgLvl >= 5 ? "MAX" : `$${costDamage}`}
                </span>
              </button>

              {/* 5. Drone Laser */}
              <button
                onClick={() => handleUpgradeClick("drone")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-cyan-400 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/drone.png"
                      alt="Drone Laser"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-cyan-200 truncate group-hover:text-white">
                      Drone Bắn Laser ({droneCount}/3)
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Bay quanh người tự động bắn yểm trợ
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {droneCount >= 3 ? "MAX" : `$${costDrone}`}
                </span>
              </button>

              {/* 6. Turret */}
              <button
                onClick={() => handleUpgradeClick("turret")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-amber-400 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/phao_tu_dong.png"
                      alt="Pháo Tự Động"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-amber-200 truncate group-hover:text-white">
                      Pháo Tự Động ({turretCount}/4)
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Trang bị ụ súng phòng tuyến tự động
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {turretCount >= 4 ? "MAX" : `$${costTurret}`}
                </span>
              </button>

              {/* 7. NVG */}
              <button
                onClick={() => handleUpgradeClick("nvg")}
                className="h-[52px] px-3.5 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-emerald-300 flex items-center justify-between gap-3 transition text-left group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/kinh_dem.png"
                      alt="Kính Nhìn Đêm"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-emerald-200 truncate group-hover:text-white">
                      Kính Nhìn Đêm Quân Sự NVG
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      {player.hasNvg ? "Đã sở hữu • Kích hoạt chế độ nhìn đêm" : "Nhìn xuyên bóng tối trạm không gian"}
                    </div>
                  </div>
                </div>
                <span className="w-[74px] text-center py-1 bg-amber-500/15 border border-amber-400/35 text-amber-300 font-extrabold text-xs shrink-0">
                  {player.hasNvg ? "SỞ HỮU" : `$${costNvg}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

