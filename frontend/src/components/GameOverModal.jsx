import React from "react";

export default function GameOverModal({ stats, onRestart, onReturnLobby }) {
  if (!stats) return null;

  const {
    mapId = 1,
    wave = 1,
    maxWaves = 5,
    kills = 0,
    timeStr = "00:00",
    credits = 0
  } = stats;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-xl flex items-center justify-center p-4 select-none font-mono-tech">
      <div
        className="w-full max-w-lg p-6 flex flex-col gap-4 border-2 border-rose-500/70 text-center shadow-[0_0_50px_rgba(244,63,94,0.35)]"
        style={{
          background: "rgba(7, 11, 19, 0.98)"
        }}
      >
        {/* Skull Icon */}
        <div className="mx-auto w-14 h-14 bg-rose-500/20 border-2 border-rose-400/60 flex items-center justify-center text-rose-400 shadow-lg animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-8 h-8 fill-current drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
            aria-hidden="true"
          >
            <path d="M416 398.9c58.5-41.1 96-104.1 96-174.9C512 100.3 397.4 0 256 0S0 100.3 0 224c0 70.7 37.5 133.8 96 174.9c0 .4 0 .7 0 1.1l0 64c0 26.5 21.5 48 48 48l48 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 64 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 48 0c26.5 0 48-21.5 48-48l0-64c0-.4 0-.7 0-1.1zM96 256a64 64 0 1 1 128 0A64 64 0 1 1 96 256zm256-64a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
          </svg>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold uppercase tracking-wider">
            TÍN HIỆU SINH TỒN ĐÃ MẤT // TỬ TRẬN
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 uppercase">
            CHIẾN BINH ĐÃ HY SINH! // <span className="text-rose-400">NHIỆM VỤ THẤT BẠI</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Bầy Xenomorph &amp; Á Trùm Praetorian đã áp đảo vị trí phòng thủ. Hãy tận dụng Máy phát điện, Kho vũ khí và thử lại!
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 border border-rose-500/30 text-xs">
          <div>
            <div className="text-[9px] text-slate-400">BẢN ĐỒ</div>
            <div className="font-extrabold text-cyan-300 mt-0.5 text-[11px]">
              Map {mapId}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400">ĐỢT QUÁI</div>
            <div className="font-extrabold text-amber-400 mt-0.5 text-[11px]">
              Đợt {wave}/{maxWaves}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400">QUÁI ĐÃ DIỆT</div>
            <div className="font-extrabold text-rose-400 mt-0.5 text-[11px]">
              {kills}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400">THỜI GIAN</div>
            <div className="font-extrabold text-emerald-400 mt-0.5 text-[11px]">
              {timeStr}
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-amber-950/40 border border-amber-500/30 text-xs">
          <span className="text-slate-400 text-[11px]">QUỸ TIỀN TÍCH LŨY:</span>
          <span className="text-amber-300 font-black text-sm">
            ${credits.toLocaleString("vi-VN")}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer active:scale-95"
          >
            <span>CHƠI LẠI</span>
          </button>
          <button
            onClick={onReturnLobby}
            className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/40 transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer active:scale-95"
          >
            <span>VỀ SẢNH / ĐỔI MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
}

