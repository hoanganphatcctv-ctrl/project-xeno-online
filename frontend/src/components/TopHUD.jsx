import React, { useState, useEffect } from "react";
import socketService from "../network/socket";

export default function TopHUD({
  roomCode,
  isHost,
  onLeaveRoom
}) {
  const [teammateDown, setTeammateDown] = useState(false);
  const [ping, setPing] = useState(18);

  useEffect(() => {
    const handleDown = () => setTeammateDown(true);
    const handleRevived = () => setTeammateDown(false);

    socketService.on("teammate_down", handleDown);
    socketService.on("teammate_revived", handleRevived);

    // Dynamic Ping estimation
    const interval = setInterval(() => {
      if (socketService.socket && socketService.connected) {
        const start = Date.now();
        socketService.socket.volatile.emit("ping_check", () => {
          setPing(Math.max(5, Date.now() - start));
        });
      }
    }, 4000);

    return () => {
      socketService.off("teammate_down", handleDown);
      socketService.off("teammate_revived", handleRevived);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-1.5 bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] text-xs font-mono-tech select-none">
      <div className="flex items-center gap-1.5 font-black text-cyan-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{isHost ? "HOST (P1)" : "CLIENT (P2)"}</span>
      </div>

      <span className="text-slate-600">|</span>

      <div className="text-slate-300 font-bold">
        MÃ PHÒNG: <span className="text-amber-300 tracking-wider">{roomCode}</span>
      </div>

      <span className="text-slate-600">|</span>

      <div className="text-emerald-400 font-bold">
        PING: <span className="text-slate-200">{ping}ms</span>
      </div>

      <span className="text-slate-600">|</span>

      <div className="text-cyan-400 font-bold text-[10px] px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-800">
        30Hz SOCKET.IO
      </div>

      {teammateDown && (
        <div className="animate-pulse flex items-center gap-1 text-rose-400 font-black bg-rose-950/80 px-2 py-0.5 border border-rose-500/60">
          <span>⚠️ ĐỒNG ĐỘI BỊ GỤC!</span>
        </div>
      )}

      {onLeaveRoom && (
        <button
          onClick={onLeaveRoom}
          className="ml-2 px-2 py-0.5 text-[10px] bg-rose-900/60 hover:bg-rose-700 text-rose-200 border border-rose-500/50 transition cursor-pointer"
        >
          RỜI PHÒNG
        </button>
      )}
    </div>
  );
}
