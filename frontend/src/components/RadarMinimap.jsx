import React, { useRef, useEffect, useState } from "react";

export default function RadarMinimap({ engineRef }) {
  const canvasRef = useRef(null);
  const [currentRoomName, setCurrentRoomName] = useState("TRẠM KHÔNG GIAN");

  useEffect(() => {
    let animId = null;

    const render = () => {
      const engine = engineRef?.current;
      const canvas = canvasRef.current;
      if (!engine || !canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const data = typeof engine.getMinimapData === "function" ? engine.getMinimapData() : null;
      if (!data) {
        animId = requestAnimationFrame(render);
        return;
      }

      if (data.currentRoom) {
        setCurrentRoomName((prev) => (prev !== data.currentRoom ? data.currentRoom : prev));
      }

      const ctx = canvas.getContext("2d");
      const mw = canvas.width;
      const mh = canvas.height;
      const scaleX = mw / (data.worldW || 3000);
      const scaleY = mh / (data.worldH || 3000);

      // 1. Dark Grid Background
      ctx.fillStyle = "#060a12";
      ctx.fillRect(0, 0, mw, mh);

      // 2. Rooms
      if (Array.isArray(data.rooms)) {
        data.rooms.forEach((r) => {
          ctx.fillStyle = r.isCenter ? "#172554" : "#0f172a";
          ctx.fillRect(r.x * scaleX, r.y * scaleY, Math.max(2, r.w * scaleX - 0.5), Math.max(2, r.h * scaleY - 0.5));
        });
      }

      // 3. Walls
      if (Array.isArray(data.walls)) {
        ctx.fillStyle = "#334155";
        data.walls.forEach((w) => {
          ctx.fillRect(w.x * scaleX, w.y * scaleY, Math.max(1.2, w.w * scaleX), Math.max(1.2, w.h * scaleY));
        });
      }

      // 4. Doors
      if (Array.isArray(data.doors)) {
        data.doors.forEach((d) => {
          ctx.fillStyle = d.openAmount >= 0.5 ? "#10b981" : "#ef4444";
          ctx.fillRect(d.x * scaleX, d.y * scaleY, Math.max(1.5, d.w * scaleX), Math.max(1.5, d.h * scaleY));
        });
      }

      // 5. Nuclear Bio-Vats
      if (Array.isArray(data.nuclearVats)) {
        ctx.fillStyle = "#4ade80";
        data.nuclearVats.forEach((v) => {
          if (v.active) {
            ctx.fillRect(v.x * scaleX - 1.5, v.y * scaleY - 1.5, 3, 3);
          }
        });
      }

      // 6. Generator Station
      if (data.generator) {
        ctx.fillStyle = data.generator.active ? "#38bdf8" : "#f59e0b";
        ctx.beginPath();
        ctx.arc(data.generator.x * scaleX, data.generator.y * scaleY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Active Auto-Turrets
      if (Array.isArray(data.turrets)) {
        ctx.fillStyle = "#22c55e";
        data.turrets.forEach((tr) => {
          ctx.beginPath();
          ctx.arc(tr.x * scaleX, tr.y * scaleY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 8. Camera Viewport Box
      if (data.camera) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          data.camera.x * scaleX,
          data.camera.y * scaleY,
          data.camera.w * scaleX,
          data.camera.h * scaleY
        );
      }

      // 9. Enemies (Red Blips)
      if (Array.isArray(data.enemyBlips)) {
        for (let i = 0; i < data.enemyBlips.length; i++) {
          const e = data.enemyBlips[i];
          ctx.fillStyle = e.isElite ? "#f97316" : "#ef4444";
          ctx.fillRect(e.x * scaleX - 1, e.y * scaleY - 1, e.isElite ? 2.5 : 2, e.isElite ? 2.5 : 2);
        }
      }

      // 10. Bosses (Pulsing Diamond/Skull)
      if (Array.isArray(data.bossBlips)) {
        const now = performance.now();
        const pulse = 3.5 + Math.sin(now * 0.01) * 1.5;
        data.bossBlips.forEach((b) => {
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(b.x * scaleX, b.y * scaleY, pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // 11. Teammate (Cyan Diamond & Sight Vector)
      if (data.teammate && data.teammate.active) {
        const tx = data.teammate.x * scaleX;
        const ty = data.teammate.y * scaleY;
        ctx.fillStyle = data.teammate.isDown ? "#f43f5e" : "#22d3ee";
        ctx.beginPath();
        ctx.moveTo(tx, ty - 3.5);
        ctx.lineTo(tx + 3.5, ty);
        ctx.lineTo(tx, ty + 3.5);
        ctx.lineTo(tx - 3.5, ty);
        ctx.closePath();
        ctx.fill();
      }

      // 12. Local Player (Yellow Dot + Vision Cone)
      if (data.player) {
        const px = data.player.x * scaleX;
        const py = data.player.y * scaleY;

        // Vision Cone
        ctx.fillStyle = "rgba(250, 204, 21, 0.22)";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.arc(px, py, 14, data.player.angle - 0.45, data.player.angle + 0.45);
        ctx.closePath();
        ctx.fill();

        // Player Center Blip
        ctx.fillStyle = data.player.isDown ? "#f43f5e" : "#facc15";
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [engineRef]);

  return (
    <div className="pointer-events-none absolute top-2.5 right-2.5 z-40 flex flex-col items-end gap-1.5 w-[218px] select-none font-mono-tech">
      <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 p-2 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col gap-1 w-full">
        {/* Header Banner */}
        <div className="flex items-center justify-between text-[9px] px-0.5 gap-2 border-b border-slate-800 pb-1">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 truncate max-w-[130px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
            <span className="truncate uppercase">{currentRoomName}</span>
          </span>
          <span className="text-[9px] text-cyan-400/80 font-extrabold tracking-wider shrink-0">
            RADAR 5x5
          </span>
        </div>

        {/* Minimap Canvas Container */}
        <div className="relative overflow-hidden border border-slate-800 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={200}
            height={136}
            className="block w-full h-[136px]"
          />
          {/* Cyberpunk Reticle Corners */}
          <span className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-cyan-400 pointer-events-none"></span>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-cyan-400 pointer-events-none"></span>
          <span className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-cyan-400 pointer-events-none"></span>
          <span className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-cyan-400 pointer-events-none"></span>
        </div>
      </div>
    </div>
  );
}

