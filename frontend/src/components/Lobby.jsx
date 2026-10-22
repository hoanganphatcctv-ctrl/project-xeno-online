import React, { useState, useEffect } from "react";
import socketService from "../network/socket";

export const CAMPAIGN_MAPS = [
  {
    id: 1,
    name: "MAP 1 • KHU ALPHA",
    title: "Khu Nghiên Cứu Alpha",
    boss: "OMEGA BEHEMOTH",
    waves: 5,
    img: "/map/map_01.png",
    briefing: "Màn 1 gồm 5 đợt quái. Làm quen vũ khí cơ bản, tìm Máy phát điện và tiêu diệt Omega Behemoth."
  },
  {
    id: 2,
    name: "MAP 2 • TÀU ORION-IX",
    title: "Trục Chính Tàu Orion-IX",
    boss: "SONG TRÙM VOID EMPEROR",
    waves: 6,
    img: "/map/map_02.png",
    briefing: "Màn 2 gồm 6 đợt quái. Bắn phá Kén Ngủ Đông, kích hoạt Lõi Điện Từ và tiêu diệt Song Trùm."
  },
  {
    id: 3,
    name: "MAP 3 • TRẠM EUROPA",
    title: "Trạm Băng Giá Europa",
    boss: "TAM TRÙM CRYO LEVIATHAN",
    waves: 6,
    img: "/map/map_03.png",
    briefing: "Màn 3 mở khóa Shotgun M1014. Nhiệt độ âm sâu, tiêu diệt Tam Quái Thần Băng Leviathans."
  },
  {
    id: 4,
    name: "MAP 4 • VỰC DUNG NHAM MAGMA",
    title: "Lò Phản Ứng Núi Lửa Magma",
    boss: "TỨ ĐẠI BẠO CHÚA MAGMA",
    waves: 7,
    img: "/map/map_04.png",
    briefing: "Màn 4 mở khóa Minigun M134. Dung nham sôi sục, tiêu diệt 4 Bạo Chúa Nham Thạch."
  },
  {
    id: 5,
    name: "MAP 5 • HIVE CITADEL",
    title: "Thánh Địa Tổ Mẹ Hive Citadel",
    boss: "NGŨ ĐẠI BẠO CHÚA HIVE EMPRESS",
    waves: 7,
    img: "/map/map_05.png",
    briefing: "Tổ quỷ trung tâm ngập tràn dịch độc, tiêu diệt Hội Đồng 5 Nữ Hoàng Hive Empress."
  },
  {
    id: 6,
    name: "MAP 6 • SINGULARITY RIFTS",
    title: "Dị Điểm Chân Trời Sự Kiện",
    boss: "LỤC ĐẠI HƯ KHÔNG THẦN",
    waves: 8,
    img: "/map/map_06.png",
    briefing: "Bão lượng tử bẻ cong không gian, đối đầu 6 Chúa Tể Dị Điểm Singularity Overlords."
  },
  {
    id: 7,
    name: "MAP 7 • CYBER-PRIME",
    title: "Chiến Hạm Mecha-Prime",
    boss: "THẤT ĐẠI TITAN CƠ KHÍ",
    waves: 8,
    img: "/map/map_07.png",
    briefing: "Pháo đài cơ khí tối tân, tiêu diệt 7 Chiến Thần Quỹ Đạo Mecha-Prime Titans."
  },
  {
    id: 8,
    name: "MAP 8 • ABYSSAL TRENCH",
    title: "Rãnh Đại Dương Sâu Abyssal",
    boss: "BÁT ĐẠI THỦY QUÁI KRAKEN",
    waves: 9,
    img: "/map/map_08.png",
    briefing: "Vực sâu tăm tối ngập tràn axit lỏng, tiêu diệt 8 Thủy Quái Đáy Vực Kraken."
  },
  {
    id: 9,
    name: "MAP 9 • DARK FORTRESS",
    title: "Pháo Đài Hắc Vật Chất",
    boss: "CỬU VƯƠNG HẮC VẬT CHẤT",
    waves: 9,
    img: "/map/map_09.png",
    briefing: "Hắc ám bao trùm toàn bộ trạm, đối đầu 9 Chúa Tể Hắc Vật Chất Dark Overlords."
  },
  {
    id: 10,
    name: "MAP 10 • OMEGA ZERO",
    title: "Vùng Đất Tận Cùng Omega Zero",
    boss: "THẬP VƯƠNG TẬN THẾ OMEGA ZERO",
    waves: 10,
    img: "/map/map_10.png",
    briefing: "Trận quyết chiến tối hậu: Tiêu diệt 10 Đại Bạo Vương Tận Thế Omega Zero!"
  }
];

export default function Lobby({ onStartGame }) {
  const [showCoopModal, setShowCoopModal] = useState(false);
  const [showMapDrawer, setShowMapDrawer] = useState(false);
  const [coopTab, setCoopTab] = useState("host"); // "host" | "join"
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [peerReady, setPeerReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedMap, setSelectedMap] = useState(1);

  // Check URL if ?room=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      setJoinInput(roomParam.toUpperCase());
      setCoopTab("join");
      setShowCoopModal(true);
    }
  }, []);

  const handleOpenCoop = async () => {
    setShowCoopModal(true);
    socketService.connect();
    if (coopTab === "host") {
      try {
        setStatusMessage("Đang tạo phòng trên Node.js Server...");
        const code = await socketService.createRoom(selectedMap);
        setRoomCode(code);
        setIsHost(true);
        setStatusMessage("Phòng đã mở! Chờ đồng đội kết nối...");
      } catch (err) {
        setStatusMessage("Lỗi kết nối: " + err.message);
      }
    }
  };

  const handleCreateHostRoom = async () => {
    setCoopTab("host");
    try {
      setStatusMessage("Đang tạo phòng mới...");
      const code = await socketService.createRoom(selectedMap);
      setRoomCode(code);
      setIsHost(true);
      setPeerReady(false);
      setStatusMessage("Phòng đã sẵn sàng! Gửi mã PIN hoặc Link cho bạn bè.");
    } catch (err) {
      setStatusMessage("Lỗi: " + err.message);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinInput.trim()) return;
    setStatusMessage(`Đang kết nối tới phòng [${joinInput.trim().toUpperCase()}]...`);
    try {
      await socketService.joinRoom(joinInput.trim().toUpperCase());
      setRoomCode(joinInput.trim().toUpperCase());
      setIsHost(false);
      setStatusMessage("✅ ĐÃ KẾT NỐI! Chờ Host bắt đầu nhiệm vụ...");
    } catch (err) {
      setStatusMessage("Lỗi: " + err.message);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert(`Đã sao chép mã phòng: ${roomCode}`);
  };

  const copyDirectLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    alert(`Đã sao chép đường link tham gia: ${link}`);
  };

  const handleStartCoop = () => {
    socketService.startMission(selectedMap);
    onStartGame({ mode: "coop", isHost: true, roomCode, mapId: selectedMap });
  };

  // Socket event listeners
  useEffect(() => {
    const onPeerConnected = () => {
      setPeerReady(true);
      setStatusMessage("✅ ĐỒNG ĐỘI ĐÃ VÀO PHÒNG! Bấm Bắt Đầu để xuất trận.");
    };

    const onMissionStarted = (data) => {
      onStartGame({ mode: "coop", isHost: false, roomCode, mapId: data.mapId });
    };

    socketService.on("peer_connected", onPeerConnected);
    socketService.on("mission_started", onMissionStarted);

    return () => {
      socketService.off("peer_connected", onPeerConnected);
      socketService.off("mission_started", onMissionStarted);
    };
  }, [roomCode, onStartGame]);

  const currentMapData = CAMPAIGN_MAPS.find((m) => m.id === selectedMap) || CAMPAIGN_MAPS[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-mono-tech select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12)_0,transparent_70%)] pointer-events-none"></div>

      {/* Main Center Menu */}
      <div className="relative z-10 flex flex-col items-center gap-5 max-w-lg w-full px-6 text-center">
        <div>
          <span className="text-[11px] uppercase tracking-[0.35em] text-cyan-400 font-extrabold px-3 py-1 bg-cyan-950/70 border border-cyan-500/40">
            REACT 18 • NODE.JS • SOCKET.IO • 30Hz
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black uppercase tracking-wider text-slate-100 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
            PROJECT XENO
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
            Alien Shooter 2D Sci-Fi Survival Engine
          </p>
        </div>

        {/* Selected Map Card Banner */}
        <div
          onClick={() => setShowMapDrawer(true)}
          className="w-full bg-slate-900/90 border border-cyan-500/50 hover:border-cyan-400 p-3 flex items-center justify-between transition cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)] group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-14 h-11 border border-slate-700 bg-slate-950 overflow-hidden shrink-0">
              <img
                src={currentMapData.img}
                alt={currentMapData.name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">
                {currentMapData.name}
              </div>
              <div className="text-xs font-black text-slate-200">
                {currentMapData.title}
              </div>
              <div className="text-[9.5px] text-amber-300">
                TRÙM: {currentMapData.boss} • {currentMapData.waves} ĐỢT
              </div>
            </div>
          </div>
          <span className="text-xs text-cyan-300 font-extrabold group-hover:translate-x-1 transition px-2">
            ĐỔI ➔
          </span>
        </div>

        <div className="w-full flex flex-col gap-3">
          {/* Nút Chiến dịch Solo */}
          <button
            onClick={() => onStartGame({ mode: "solo", mapId: selectedMap })}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-widest transition shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            CHẾ ĐỘ CHIẾN DỊCH (SOLO)
          </button>

          {/* Nút Co-Op 2 Người */}
          <button
            onClick={handleOpenCoop}
            className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 font-black text-sm uppercase tracking-widest transition shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚔️ TÁC CHIẾN ONLINE CO-OP (TEAM 2)</span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400">
              30Hz
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500">
          © 2026 Antigravity Team • 100% Free Dedicated Multiplayer
        </div>
      </div>

      {/* MAP SELECTION DRAWER / MODAL */}
      {showMapDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-cyan-500/60 p-5 flex flex-col gap-4 shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-cyan-300">
                  🗺️ BẢNG CHỌN CHIẾN TRƯỜNG TÁC CHIẾN (10 MAPS)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Chọn bản đồ để bắt đầu chiến dịch Solo hoặc xuất phát phòng Co-op
                </p>
              </div>
              <button
                onClick={() => setShowMapDrawer(false)}
                className="text-slate-400 hover:text-rose-400 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            {/* Grid 10 Maps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[68vh] pr-1">
              {CAMPAIGN_MAPS.map((m) => {
                const isSelected = selectedMap === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMap(m.id);
                      setShowMapDrawer(false);
                    }}
                    className={`relative p-3 border transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full h-28 border border-slate-800 overflow-hidden bg-slate-950">
                      <img
                        src={m.img}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
                        {m.name}
                      </span>
                      {isSelected && (
                        <span className="absolute bottom-1.5 right-1.5 bg-emerald-500 text-slate-950 px-2 py-0.5 text-[9px] font-black">
                          ✓ ĐANG CHỌN
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-100">{m.title}</div>
                      <div className="text-[9.5px] text-rose-400 font-bold mt-0.5">
                        TRÙM: {m.boss}
                      </div>
                      <div className="text-[9px] text-amber-300">
                        SỐ ĐỢT: {m.waves} LƯỢT
                      </div>
                      <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-2">
                        {m.briefing}
                      </p>
                    </div>

                    <button
                      className={`w-full py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {isSelected ? "CHIẾN TRƯỜNG ĐÃ CHỌN" : "CHỌN MAP NÀY"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CO-OP MODAL */}
      {showCoopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-slate-950 border border-cyan-500/50 p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-cyan-300">
                  PHÒNG TÁC CHIẾN CO-OP (TEAM 2)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Kênh truyền Socket.io 30Hz • Ping thấp • Tiền riêng
                </p>
              </div>
              <button
                onClick={() => setShowCoopModal(false)}
                className="text-slate-400 hover:text-rose-400 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCreateHostRoom}
                className={`py-2 text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                  coopTab === "host"
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                1. TẠO PHÒNG (HOST)
              </button>
              <button
                onClick={() => setCoopTab("join")}
                className={`py-2 text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                  coopTab === "join"
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                2. THAM GIA (JOIN)
              </button>
            </div>

            {/* Content Tab Host */}
            {coopTab === "host" ? (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                    MÃ PHÒNG PIN 6 KÝ TỰ:
                  </div>
                  <div className="text-3xl font-black tracking-widest text-amber-300">
                    {roomCode || "ĐANG TẠO..."}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={copyRoomCode}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer"
                    >
                      SAO CHÉP MÃ
                    </button>
                    <button
                      onClick={copyDirectLink}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 transition cursor-pointer"
                    >
                      SAO CHÉP LINK
                    </button>
                  </div>
                </div>

                {/* Map Preview for Host */}
                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 p-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentMapData.img}
                      alt={currentMapData.name}
                      className="w-10 h-8 object-cover border border-slate-700 shrink-0"
                    />
                    <div className="text-left">
                      <div className="text-[9px] text-cyan-400 font-bold uppercase">{currentMapData.name}</div>
                      <div className="text-[11px] font-black text-slate-200">{currentMapData.title}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMapDrawer(true)}
                    className="text-[10px] font-extrabold text-cyan-300 hover:underline px-2 cursor-pointer"
                  >
                    ĐỔI MAP
                  </button>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 border border-slate-800">
                  {statusMessage}
                </div>

                <button
                  onClick={handleStartCoop}
                  disabled={!peerReady}
                  className={`w-full py-3.5 font-black text-sm uppercase tracking-wider transition ${
                    peerReady
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  }`}
                >
                  {peerReady ? "⚔️ XUẤT TRẬN CO-OP NGAY!" : "CHỜ ĐỒNG ĐỘI KẾT NỐI..."}
                </button>
              </div>
            ) : (
              /* Content Tab Join */
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    NHẬP MÃ PHÒNG (VÍ DỤ: XN82K9):
                  </label>
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value)}
                    placeholder="Mã PIN 6 ký tự..."
                    maxLength={10}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 px-4 py-2.5 text-base font-black tracking-widest uppercase text-cyan-200 outline-none"
                  />
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 border border-slate-800">
                  {statusMessage || "Nhập mã phòng và bấm Kết Nối để tham chiến."}
                </div>

                <button
                  onClick={handleJoinRoom}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  KẾT NỐI VÀO PHÒNG HOST
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
