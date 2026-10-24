import React, { useState, useEffect } from "react";

export default function VictoryModal({
  stats,
  isHost = true,
  mode = "solo",
  onNextMap,
  onRestartMap,
  onReturnLobby
}) {
  const [countdown, setCountdown] = useState(3);

  const isCoopClient = mode === "coop" && !isHost;

  useEffect(() => {
    if (isCoopClient) return; // Client waits for host map switch event

    if (countdown <= 0) {
      onNextMap();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onNextMap, isCoopClient]);

  if (!stats) return null;

  const {
    mapId = 1,
    kills = 0,
    timeStr = "02:45",
    credits = 0
  } = stats;

  const nextMapId = mapId < 10 ? mapId + 1 : 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 select-none font-mono-tech">
      <div
        className="w-full max-w-lg p-6 flex flex-col gap-4 border-2 border-emerald-500/60 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]"
        style={{
          background: "rgba(7, 11, 19, 0.98)"
        }}
      >
        {/* WIN Badge Icon */}
        <div className="mx-auto w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center text-sm font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          WIN
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
            HOÀN THÀNH NHIỆM VỤ CHIẾN DỊCH
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 uppercase">
            ĐÃ TIÊU DIỆT QUÂN ĐOÀN TRÙM CUỐI!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Toàn bộ các phân khu trong Trạm Không Gian đã được quét sạch bầy Xenomorph.
          </p>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 border border-slate-800 text-xs">
          <div>
            <div className="text-[9px] text-slate-400">BẢN ĐỒ</div>
            <div className="font-extrabold text-sky-400 mt-0.5">Map {mapId}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400">THỜI GIAN</div>
            <div className="font-extrabold text-amber-400 mt-0.5">{timeStr}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400">QUÁI ĐÃ DIỆT</div>
            <div className="font-extrabold text-rose-400 mt-0.5">{kills}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400">QUỸ TIỀN</div>
            <div className="font-extrabold text-emerald-400 mt-0.5">
              ${credits.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Auto Countdown or Coop Waiting */}
        {isCoopClient ? (
          <div className="text-[11px] font-bold text-sky-300 bg-sky-950/50 border border-sky-500/40 py-2 px-3 animate-pulse">
            ⏳ ĐANG ĐỢI CHỦ PHÒNG (HOST) CHUYỂN SANG MAP {nextMapId}...
          </div>
        ) : (
          <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 py-1.5 px-3">
            Tự động chuyển sang chặng tiếp theo sau{" "}
            <span className="text-amber-300 font-black">{countdown}</span> giây...
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {isCoopClient ? (
            <div className="w-full py-3 px-4 bg-slate-800/80 border border-sky-500/40 text-sky-300 font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-wider">
              <span>ĐỒNG BỘ CHIẾN DỊCH VỚI HOST ➔ MAP {nextMapId}</span>
            </div>
          ) : (
            <button
              onClick={onNextMap}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl transition flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-95"
            >
              <span>
                TIẾP BƯỚC CHIẾN DỊCH NGAY ➔ MAP {nextMapId} (GIỮ VŨ KHÍ &amp; NÂNG CẤP)
              </span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {!isCoopClient && (
              <button
                onClick={onRestartMap}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-emerald-500/50 text-emerald-300 font-black text-xs transition uppercase tracking-wider cursor-pointer active:scale-95"
              >
                CHƠI LẠI MAP NÀY
              </button>
            )}
            <button
              onClick={onReturnLobby}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/40 transition uppercase tracking-wider cursor-pointer active:scale-95"
            >
              VỀ SẢNH CHÍNH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

