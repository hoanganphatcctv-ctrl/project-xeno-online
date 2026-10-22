import React, { useState, useEffect } from "react";
import socketService from "../network/socket";

export const CAMPAIGN_MAPS = [
  {
    id: 1,
    name: "MAP 1: ALPHA",
    code: "MAP 1 • 1 BOSS",
    title: "KHU NGHIÊN CỨU ALPHA",
    boss: "OMEGA BEHEMOTH",
    waves: 5,
    img: "/map/map_01.png",
    desc: "Đại sảnh Trung tâm lớn kết nối 8 phòng vệ tinh. Khởi đầu với Súng Lục Đôi và $80 ngân quỹ.",
    briefing: "Màn 1 gồm 5 đợt quái. Làm quen vũ khí cơ bản, tìm Máy phát điện [E] và tiêu diệt Omega Behemoth."
  },
  {
    id: 2,
    name: "MAP 2: ORION-IX",
    code: "MAP 2 • 2 BOSS",
    title: "TRỤC CHÍNH TÀU ORION-IX",
    boss: "SONG TRÙM VOID EMPEROR",
    waves: 6,
    img: "/map/map_02.png",
    desc: "Khoang tàu chiến hạm không gian với buồng ngủ đông và hệ thống cửa tự động.",
    briefing: "Màn 2 gồm 6 đợt quái. Bắn phá Kén Ngủ Đông, kích hoạt Lõi Điện Từ và tiêu diệt Song Trùm."
  },
  {
    id: 3,
    name: "MAP 3: EUROPA",
    code: "MAP 3 • 3 BOSS",
    title: "TRẠM BĂNG GIÁ EUROPA",
    boss: "TAM TRÙM CRYO LEVIATHAN",
    waves: 6,
    img: "/map/map_03.png",
    desc: "Vùng đất băng giá âm độ. Mở khóa Shotgun M1014 cận chiến uy lực tối thượng.",
    briefing: "Màn 3 mở khóa Shotgun M1014. Nhiệt độ âm sâu, tiêu diệt Tam Quái Thần Băng Leviathans."
  },
  {
    id: 4,
    name: "MAP 4: MAGMA",
    code: "MAP 4 • 4 BOSS",
    title: "LÒ DUNG NHAM MAGMA",
    boss: "TỨ ĐẠI BẠO CHÚA MAGMA",
    waves: 7,
    img: "/map/map_04.png",
    desc: "Vực dung nham nóng đỏ sôi sục. Mở khóa Hỏa Thần Minigun M134 càn quét diện rộng.",
    briefing: "Màn 4 mở khóa Minigun M134. Dung nham sôi sục, tiêu diệt 4 Bạo Chúa Nham Thạch."
  },
  {
    id: 5,
    name: "MAP 5: CITADEL",
    code: "MAP 5 • 5 BOSS",
    title: "THÁNH ĐỊA HIVE CITADEL",
    boss: "NGŨ ĐẠI HIVE EMPRESS",
    waves: 7,
    img: "/map/map_05.png",
    desc: "Tổ quỷ trung tâm ngập tràn dịch độc và kén đột biến. Súng Phun Lửa M9A2 tối cần thiết.",
    briefing: "Tổ quỷ trung tâm ngập tràn dịch độc, tiêu diệt Hội Đồng 5 Nữ Hoàng Hive Empress."
  },
  {
    id: 6,
    name: "MAP 6: DỊ ĐIỂM",
    code: "MAP 6 • 6 BOSS",
    title: "SINGULARITY RIFTS",
    boss: "LỤC ĐẠI HƯ KHÔNG THẦN",
    waves: 8,
    img: "/map/map_06.png",
    desc: "Bão lượng tử bẻ cong không thời gian. Mở khóa Súng Băng Cryo M4 làm chậm kẻ thù.",
    briefing: "Bão lượng tử bẻ cong không gian, đối đầu 6 Chúa Tể Dị Điểm Singularity Overlords."
  },
  {
    id: 7,
    name: "MAP 7: MECHA-PRIME",
    code: "MAP 7 • 7 BOSS",
    title: "CHIẾN HẠM MECHA-PRIME",
    boss: "THẤT ĐẠI TITAN CƠ KHÍ",
    waves: 8,
    img: "/map/map_07.png",
    desc: "Pháo đài cơ giới siêu vũ trụ. Pháo Gauss M82 xuyên giáp mọi mục tiêu.",
    briefing: "Pháo đài cơ khí tối tân, tiêu diệt 7 Chiến Thần Quỹ Đạo Mecha-Prime Titans."
  },
  {
    id: 8,
    name: "MAP 8: POSEIDON-X",
    code: "MAP 8 • 8 BOSS",
    title: "RÃNH SÂU ABYSSAL TRENCH",
    boss: "BÁT ĐẠI THỦY QUÁI KRAKEN",
    waves: 9,
    img: "/map/map_08.png",
    desc: "Vực sâu tăm tối ngập tràn axit lỏng và các luồng sóng xung kích sinh học.",
    briefing: "Vực sâu tăm tối ngập tràn axit lỏng, tiêu diệt 8 Thủy Quái Đáy Vực Kraken."
  },
  {
    id: 9,
    name: "MAP 9: CHRONOS",
    code: "MAP 9 • 9 BOSS",
    title: "PHÁO ĐÀI HẮC VẬT CHẤT",
    boss: "CỬU VƯƠNG HẮC VẬT CHẤT",
    waves: 9,
    img: "/map/map_09.png",
    desc: "Hắc ám bao trùm toàn bộ trạm không gian. Yêu cầu phối hợp đồng đội tối đa.",
    briefing: "Hắc ám bao trùm toàn bộ trạm, đối đầu 9 Chúa Tể Hắc Vật Chất Dark Overlords."
  },
  {
    id: 10,
    name: "MAP 10: GENESIS",
    code: "MAP 10 • 10 BOSS",
    title: "VÙNG ĐẤT OMEGA ZERO",
    boss: "THẬP VƯƠNG TẬN THẾ",
    waves: 10,
    img: "/map/map_10.png",
    desc: "Trận chiến sinh tử tối hậu của nhân loại. Pháo Laze Hyperion X-7 sẵn sàng xung trận!",
    briefing: "Trận quyết chiến tối hậu: Tiêu diệt 10 Đại Bạo Vương Tận Thế Omega Zero!"
  }
];

export const WEAPONS_INFO = [
  { id: 0, name: "Song Lục MK23", type: "Pistol", damage: "22 x 2", rpm: "420", desc: "Vũ khí tiêu chuẩn, đạn vô hạn, độ cơ động cao.", img: "/assets/01_gun.png" },
  { id: 1, name: "Shotgun M1014", type: "Spread", damage: "18 x 7", rpm: "85", desc: "Bắn 7 viên ria sát thương cực lớn ở cự ly gần.", img: "/assets/short_gun02.png" },
  { id: 2, name: "Minigun M134", type: "Gatling", damage: "28", rpm: "980", desc: "Hỏa lực áp đảo với tốc độ bắn khủng khiếp.", img: "/assets/gatling_gun03.png" },
  { id: 3, name: "Phun Lửa M9A2", type: "Flamethrower", damage: "45/s", rpm: "Stream", desc: "Xuyên thấu nhóm đông, thiêu đốt liên tục.", img: "/assets/fire_gun.png" },
  { id: 4, name: "Súng Băng Cryo M4", type: "Cryo", damage: "35", rpm: "360", desc: "Làm chậm 60% tốc độ di chuyển của Alien.", img: "/assets/sung_bang05.png" },
  { id: 5, name: "Gauss Cannon M82", type: "Heavy Rail", damage: "320", rpm: "55", desc: "Đạn xuyên phá tạo vụ nổ động năng hủy diệt.", img: "/assets/phao-06.png" },
  { id: 6, name: "Hyperion Laser X-7", type: "Continuous Beam", damage: "850/s", rpm: "Instant", desc: "Chùm tia năng lượng cao thiêu rụi mọi vật cản.", img: "/assets/laze_gun07.png" }
];

export default function Lobby({ onStartGame }) {
  const [selectedMap, setSelectedMap] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium"); // "easy" | "medium" | "hard"
  const [showCoopModal, setShowCoopModal] = useState(false);
  const [showMapDrawer, setShowMapDrawer] = useState(false);
  const [showArmoryModal, setShowArmoryModal] = useState(false);
  const [showIntelDrawer, setShowIntelDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Tactical settings
  const [bloodColor, setBloodColor] = useState("red"); // "red" | "green"
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fpsCap, setFpsCap] = useState(120);

  // Co-op states
  const [coopTab, setCoopTab] = useState("host"); // "host" | "join"
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [peerReady, setPeerReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Audio helper
  const playSfx = (type = "click") => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(type === "start" ? "/audio/Wav/buy.wav" : "/audio/Wav/ammo_pickup.wav");
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch (_) {}
  };

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
    playSfx("click");
    setShowCoopModal(true);
    socketService.connect();
    if (coopTab === "host") {
      try {
        setStatusMessage("Đang mở phòng tác chiến trên Server Node.js...");
        const code = await socketService.createRoom(selectedMap);
        setRoomCode(code);
        setIsHost(true);
        setStatusMessage("Phòng đã mở! Chờ đồng đội kết nối qua mã PIN hoặc Link...");
      } catch (err) {
        setStatusMessage("Lỗi kết nối: " + err.message);
      }
    }
  };

  const handleCreateHostRoom = async () => {
    playSfx("click");
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
    playSfx("click");
    setStatusMessage(`Đang kết nối tới phòng [${joinInput.trim().toUpperCase()}]...`);
    try {
      await socketService.joinRoom(joinInput.trim().toUpperCase());
      setRoomCode(joinInput.trim().toUpperCase());
      setIsHost(false);
      setStatusMessage("✅ ĐÃ KẾT NỐI! Chờ Host bắt đầu nhiệm vụ...");
    } catch (err) {
      setStatusMessage("Lỗi kết nối: " + err.message);
    }
  };

  const copyRoomCode = () => {
    playSfx("click");
    navigator.clipboard.writeText(roomCode);
    alert(`Đã sao chép mã phòng: ${roomCode}`);
  };

  const copyDirectLink = () => {
    playSfx("click");
    const link = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    alert(`Đã sao chép link tham gia: ${link}`);
  };

  const handleStartCoop = () => {
    playSfx("start");
    socketService.startMission(selectedMap);
    onStartGame({
      mode: "coop",
      isHost: true,
      roomCode,
      mapId: selectedMap,
      difficulty: selectedDifficulty,
      bloodColor,
      soundEnabled,
      fpsCap
    });
  };

  const handleStartSolo = () => {
    playSfx("start");
    onStartGame({
      mode: "solo",
      mapId: selectedMap,
      difficulty: selectedDifficulty,
      bloodColor,
      soundEnabled,
      fpsCap
    });
  };

  // Socket event listeners
  useEffect(() => {
    const onPeerConnected = () => {
      setPeerReady(true);
      setStatusMessage("✅ ĐỒNG ĐỘI ĐÃ VÀO PHÒNG! Bấm Bắt Đầu để xuất trận.");
    };

    const onMissionStarted = (data) => {
      onStartGame({
        mode: "coop",
        isHost: false,
        roomCode,
        mapId: data.mapId,
        difficulty: selectedDifficulty,
        bloodColor,
        soundEnabled,
        fpsCap
      });
    };

    socketService.on("peer_connected", onPeerConnected);
    socketService.on("mission_started", onMissionStarted);

    return () => {
      socketService.off("peer_connected", onPeerConnected);
      socketService.off("mission_started", onMissionStarted);
    };
  }, [roomCode, onStartGame, selectedDifficulty, bloodColor, soundEnabled, fpsCap]);

  const currentMap = CAMPAIGN_MAPS.find((m) => m.id === selectedMap) || CAMPAIGN_MAPS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-hidden select-none flex flex-col justify-between font-mono-tech">
      {/* LAYER 1: AUTHENTIC SCI-FI SPACEPORT HERO BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/assets/Project%20Xeno_%20Reloaded%20Spaceport-3.png'), url('/assets/spaceport.png'), url('/assets/lobby_bg.png'), radial-gradient(circle at 62% 38%, rgba(20, 83, 45, 0.45) 0%, rgba(6, 24, 44, 0.78) 48%, rgba(4, 7, 13, 0.98) 100%)`
        }}
      />

      {/* LAYER 2: PERSPECTIVE HOLOGRAM TACTICAL TELEMETRY SCREEN */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        <div
          className="absolute right-[6%] top-[10%] w-[58%] h-[68%] border-2 border-emerald-500/30 bg-[#070b13]/80 backdrop-blur-[2px] p-5 hidden lg:flex flex-col justify-between opacity-85 shadow-[0_0_60px_rgba(16,185,129,0.18)]"
          style={{ transform: "perspective(1100px) rotateY(-14deg) rotateX(2deg)" }}
        >
          <div className="flex items-center justify-between border-b border-emerald-400/25 pb-2 text-[10px] text-emerald-300/80">
            <span>GLOBAL THREAT INITIATIVE // XENO-COMMAND-01</span>
            <span>SECTOR TELEMETRY // 5200x3600</span>
          </div>

          <div className="grid grid-cols-3 gap-4 my-auto">
            <div className="border border-emerald-400/20 p-3 bg-slate-950/70">
              <div className="text-[9px] text-emerald-400/70">THREAT INDEX</div>
              <div className="text-2xl font-black text-emerald-200 mt-1">
                451 <span className="text-xs text-emerald-400">220</span>{" "}
                <span className="text-xs text-amber-300">161</span>
              </div>
              <div className="w-full h-1 bg-slate-900 mt-2 overflow-hidden">
                <div className="h-full bg-emerald-400 w-3/4 animate-pulse"></div>
              </div>
            </div>

            <div className="border border-emerald-400/20 p-3 bg-slate-950/70 flex flex-col justify-between">
              <div className="text-[9px] text-emerald-400/70">BIO-SIGNATURE SCAN</div>
              <div className="text-xs text-emerald-300 font-bold">XENOMORPH HIVE ACTIVE</div>
              <div className="text-[9px] text-slate-400">10 SECTORS ACTIVE</div>
            </div>

            <div className="border border-emerald-400/20 p-3 bg-slate-950/70 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-400/40 flex items-center justify-center animate-spin">
                <div className="w-10 h-10 rounded-full border border-emerald-300/60 bg-emerald-400/10 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-teal-400/60 border-t border-teal-400/20 pt-2">
            <span>SYS.VER // 4.5.0-ONLINE CO-OP</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ORBITAL LINK: ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* LAYER 3: VIGNETTE & DIMMING OVERLAY */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(4, 7, 13, 0.18) 0%, rgba(4, 7, 13, 0.70) 75%, rgba(2, 4, 8, 0.94) 100%)"
        }}
      />

      {/* ======================================================================
          LAYER 4: TOP BAR (AVATAR | MATCH BANNER | NAVIGATION BUTTONS)
          ====================================================================== */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-3 pb-2 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent">
        {/* TOP-LEFT: AVATAR CARD & COMMANDER TITLE */}
        <div className="flex items-center gap-3.5">
          <div
            className="mecha-avatar-frame relative w-14 h-14 bg-slate-900 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            title="Đặc Nhiệm Commander Xeno"
          >
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950 text-emerald-300">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z" />
              </svg>
            </div>
            {/* Level Badge */}
            <span className="mecha-avatar-badge absolute bottom-0 right-0 px-1.5 py-0.5 bg-slate-950/95 text-[9px] font-black text-emerald-300 leading-none z-10 border border-emerald-400/40">
              LV.8
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase">
                COMMANDER (DELTA FORCE)
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase">
                CHỈ HUY
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">● SẴN SÀNG CHIẾN ĐẤU</span>
              <span>|</span>
              <span>
                NGÂN QUỸ: <b className="text-amber-300">$120</b>
              </span>
            </div>
          </div>
        </div>

        {/* TOP-CENTER: TRANSLUCENT MATCH BANNER */}
        <div
          onClick={() => {
            playSfx("click");
            setShowMapDrawer(true);
          }}
          className="hud-panel hidden xl:flex items-center justify-between gap-6 px-5 py-2 bg-emerald-950/85 hover:bg-emerald-900/90 border border-emerald-400/60 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.25)] transition absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-emerald-200 tracking-wider uppercase">
              {currentMap.name} • {currentMap.title}
            </span>
          </div>
          <span className="text-xs text-emerald-400 font-bold">▼ ĐỔI MAP</span>
        </div>

        {/* TOP-RIGHT: UNIFIED SCI-FI NAVIGATION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSfx("click");
              setShowMapDrawer(true);
            }}
            className="tactical-top-nav-item px-3.5 py-1.5 min-w-[70px] flex flex-col items-center justify-center gap-1"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-emerald-400">
              <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider uppercase">BẢN ĐỒ</span>
          </button>

          <button
            onClick={() => {
              playSfx("click");
              setShowArmoryModal(true);
            }}
            className="tactical-top-nav-item px-3.5 py-1.5 min-w-[70px] flex flex-col items-center justify-center gap-1 relative"
          >
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-emerald-400">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider uppercase">KHO SÚNG</span>
          </button>

          <button
            onClick={() => {
              playSfx("click");
              setShowIntelDrawer(true);
            }}
            className="tactical-top-nav-item px-3.5 py-1.5 min-w-[70px] flex flex-col items-center justify-center gap-1"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-emerald-400">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider uppercase">CẨM NANG</span>
          </button>

          <button
            onClick={() => {
              playSfx("click");
              setShowSettingsModal(true);
            }}
            className="tactical-top-nav-item px-3.5 py-1.5 min-w-[70px] flex flex-col items-center justify-center gap-1"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-emerald-400">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider uppercase">CÀI ĐẶT</span>
          </button>
        </div>
      </div>

      {/* ======================================================================
          LAYER 5: MIDDLE AREA (LEFT: CAMPAIGN LORE | RIGHT: MAP CARD & TOGGLES)
          ====================================================================== */}
      <div className="relative z-20 flex-1 flex items-center justify-between px-4 sm:px-8 pointer-events-none">
        {/* Left: Project Xeno Story Watermark */}
        <div className="hidden md:flex flex-col gap-2 max-w-sm pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold w-fit">
            <span>CHIẾN DỊCH BẤT ĐỐI XỨNG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]">
            PROJECT XENO
          </h1>
          <p className="text-xs text-slate-300/90 leading-relaxed bg-slate-950/70 backdrop-blur-sm p-3 border border-slate-800">
            {currentMap.desc}
          </p>
        </div>

        {/* Right: Campaign Season Pass Card + 10 Quick Carousel Dots + Checkboxes */}
        <div className="ml-auto flex flex-col items-end gap-3 w-full max-w-[340px] pointer-events-auto">
          {/* Map Preview Card */}
          <div
            onClick={() => {
              playSfx("click");
              setShowMapDrawer(true);
            }}
            className="w-full overflow-hidden border border-slate-700 hover:border-emerald-400 bg-slate-900/90 backdrop-blur-md cursor-pointer shadow-2xl transition group"
          >
            <div className="relative h-32 p-3.5 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-black text-[10px]">
                  {currentMap.code}
                </span>
                <span className="text-[10px] text-amber-300 font-bold group-hover:translate-x-1 transition">
                  ĐỔI CHIẾN TRƯỜNG ➔
                </span>
              </div>

              <div>
                <div className="text-base font-black text-white tracking-wider uppercase drop-shadow">
                  {currentMap.title}
                </div>
                <div className="text-[10px] text-rose-300 font-bold mt-0.5">
                  TRÙM CUỐI: {currentMap.boss}
                </div>
              </div>

              {/* 10 Quick Map Carousel Dots */}
              <div
                className="flex items-center gap-1.5 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                {CAMPAIGN_MAPS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      playSfx("click");
                      setSelectedMap(m.id);
                    }}
                    className={`h-2 transition-all cursor-pointer ${
                      selectedMap === m.id
                        ? "w-4 bg-emerald-400"
                        : "w-2 bg-slate-600 hover:bg-slate-400"
                    }`}
                    title={m.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Sub-Banner */}
          <div
            onClick={() => {
              playSfx("click");
              setShowIntelDrawer(true);
            }}
            className="w-full px-3.5 py-2 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <div className="text-xs font-black text-amber-300 uppercase">
                {currentMap.name} • {currentMap.waves} ĐỢT • 1 BOSS
              </div>
              <div className="text-[10px] text-slate-400">
                Xem 4 vật thể tương tác & Cận vệ Praetorian
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold">CHI TIẾT</span>
          </div>

          {/* 3 Tactical Toggles on Right Panel */}
          <div className="flex flex-col items-end gap-2 py-1 pr-1 text-xs">
            <div
              className="flex items-center gap-2.5 text-slate-300"
              title="Máy phát điện ngẫu nhiên trong map: Giữ E 5s để khởi động"
            >
              <span className="text-[11px] font-semibold">
                Nguồn điện: <b className="text-emerald-400">Máy phát điện</b>
              </span>
              <span className="w-4 h-4 border border-emerald-400/50 bg-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-300 font-black animate-pulse">
                ⚡
              </span>
            </div>

            <button
              onClick={() => {
                playSfx("click");
                setBloodColor((b) => (b === "red" ? "green" : "red"));
              }}
              className="flex items-center gap-2.5 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold">
                Màu máu:{" "}
                <b className={bloodColor === "red" ? "text-rose-400" : "text-emerald-400"}>
                  {bloodColor === "red" ? "Đỏ" : "Xanh lá"}
                </b>
              </span>
              <span
                className={`w-3.5 h-3.5 border border-white/40 ${
                  bloodColor === "red" ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
            </button>

            <button
              onClick={() => {
                playSfx("click");
                setSoundEnabled((s) => !s);
              }}
              className="flex items-center gap-2.5 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold">
                Âm thanh:{" "}
                <b className={soundEnabled ? "text-emerald-400" : "text-slate-400"}>
                  {soundEnabled ? "Đang bật" : "Tắt tiếng"}
                </b>
              </span>
              <span className="px-1.5 py-0.2 border border-emerald-400/50 bg-emerald-500/20 text-[10px] text-emerald-300 font-bold">
                {soundEnabled ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================
          LAYER 6: BOTTOM BAR (CONTROLS TICKER | 10 TABS | CO-OP | GIANT START)
          ====================================================================== */}
      <div className="relative z-20 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4 px-4 sm:px-6 pb-3 pt-2 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent">
        {/* BOTTOM-LEFT: QUICK BUTTONS + TICKER + 10 TABS */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSfx("click");
                setShowMapDrawer(true);
              }}
              className="px-3 h-8 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0 cursor-pointer"
            >
              MAP
            </button>
            <button
              onClick={() => {
                playSfx("click");
                setShowIntelDrawer(true);
              }}
              className="px-3 h-8 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0 cursor-pointer"
            >
              INFO
            </button>
            <button
              onClick={() => {
                playSfx("click");
                setShowArmoryModal(true);
              }}
              className="px-3 h-8 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0 cursor-pointer"
            >
              WEAPONS
            </button>

            {/* Controls Ticker */}
            <div className="hud-panel truncate text-[11px] text-slate-300 bg-slate-950/85 px-3.5 h-8 flex items-center gap-1.5 border border-slate-800/90 flex-1">
              <span className="text-emerald-400 font-bold shrink-0">Hệ thống</span>
              <span className="text-slate-400 shrink-0">[Điều khiển]:</span>
              <span className="text-slate-200 truncate">
                [WASD] Chạy • [SPACE] Lướt • [E] Hack/Máy phát • [T] Tháp pháo • [1-7] Đổi súng
              </span>
            </div>
          </div>

          {/* 10 Horizontal Bottom Tabs */}
          <div className="hud-panel w-full overflow-hidden py-1 px-2.5 bg-slate-950/90 border border-slate-800/90">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 px-0.5 text-[10.5px] font-extrabold tracking-wider uppercase scrollbar-none">
              {CAMPAIGN_MAPS.map((m, idx) => (
                <React.Fragment key={m.id}>
                  {idx > 0 && <span className="text-slate-700">|</span>}
                  <button
                    onClick={() => {
                      playSfx("click");
                      setSelectedMap(m.id);
                    }}
                    className={`tactical-bottom-tab px-2.5 py-1 shrink-0 ${
                      selectedMap === m.id ? "active-tab text-emerald-300" : ""
                    }`}
                  >
                    {m.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Telemetry Footer Line */}
          <div className="flex items-center gap-3 text-[9.5px] text-slate-500 px-1">
            <span>PING: 15ms</span>
            <span>
              FPS CAP: <b className="text-emerald-400">{fpsCap} FPS</b>
            </span>
            <span>
              MÀU MÁU:{" "}
              <b className={bloodColor === "red" ? "text-rose-400" : "text-emerald-400"}>
                {bloodColor.toUpperCase()}
              </b>
            </span>
            <span className="hidden sm:inline">CO-OP MULTIPLAYER 30Hz SYNC</span>
          </div>
        </div>

        {/* BOTTOM-RIGHT: CO-OP BUTTON + DIFFICULTY SELECTOR + GIANT START */}
        <div className="flex flex-col gap-2 w-full lg:w-[370px] shrink-0">
          {/* Co-Op Online Button */}
          <button
            onClick={handleOpenCoop}
            className="w-full px-3.5 py-2 bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-slate-950/90 hover:from-cyan-900/90 border border-cyan-400/60 hover:border-cyan-300 flex items-center justify-between transition shadow-lg group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <div className="text-left min-w-0">
                <div className="text-xs font-black text-cyan-200 tracking-wider uppercase truncate">
                  TÁC CHIẾN ONLINE CO-OP (TEAM 2)
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  Đồng bộ 30Hz Real-time • WebSocket Node.js Server
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-extrabold shrink-0 group-hover:bg-cyan-500/30">
              PHÒNG CHỜ ►
            </span>
          </button>

          {/* Map & Difficulty Bar */}
          <button
            onClick={() => {
              playSfx("click");
              setShowMapDrawer(true);
            }}
            className="w-full px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-between transition shadow-lg group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                TAC
              </span>
              <span className="text-xs font-black text-white tracking-wide uppercase truncate">
                {currentMap.name}: {currentMap.title} -{" "}
                {selectedDifficulty === "easy"
                  ? "DỄ"
                  : selectedDifficulty === "medium"
                  ? "TRUNG BÌNH"
                  : "KHÓ"}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold shrink-0 ml-2 group-hover:text-emerald-300">
              ĐỔI ▲
            </span>
          </button>

          {/* Action Row: Reset Button + Giant Green START Button */}
          <div className="flex items-stretch gap-2.5 h-[68px]">
            <button
              onClick={() => {
                playSfx("click");
                setSelectedMap(1);
              }}
              className="w-[68px] bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 flex flex-col items-center justify-center gap-1 text-amber-300 transition shrink-0 cursor-pointer"
              title="Đặt lại về Map 1"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              <span className="text-[9px] font-extrabold tracking-wider">RESET</span>
            </button>

            {/* GIANT GREEN START BUTTON */}
            <button
              onClick={handleStartSolo}
              className="tactical-start-btn flex-1 px-5 py-2 flex flex-col justify-between text-slate-950 relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between w-full text-[9px] font-extrabold opacity-85 leading-none">
                <span>[XENO-DEPLOY]</span>
                <span>READY // 5200x3600</span>
              </div>
              <div className="text-2xl font-black tracking-widest uppercase text-center leading-none my-0.5">
                VÀO TRẬN
              </div>
              <div className="flex items-center justify-between w-full text-[9px] font-extrabold opacity-90 leading-none">
                <span>CHIẾN DỊCH SOLO</span>
                <span>[►]</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================
          MODAL 1: BẢN ĐỒ CHIẾN TRƯỜNG & ĐỘ KHÓ (10 MAPS)
          ====================================================================== */}
      {showMapDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="hud-modal max-w-5xl w-full max-h-[92vh] overflow-hidden p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🗺️ CHỌN CHIẾN TRƯỜNG & CẤP ĐỘ TÁC CHIẾN</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px]">
                    10 MAPS
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Lựa chọn 1 trong 10 chiến trường bất đối xứng và thiết lập độ khó
                </p>
              </div>
              <button
                onClick={() => setShowMapDrawer(false)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                Xác Nhận [ESC]
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 border border-slate-800">
              <span className="text-xs font-bold text-slate-300">ĐỘ KHÓ:</span>
              {[
                { id: "easy", name: "DỄ (TÂN BINH)", hp: "-25% HP Quái", col: "text-emerald-400" },
                { id: "medium", name: "TRUNG BÌNH (CHUẨN)", hp: "Chuẩn 100%", col: "text-amber-300" },
                { id: "hard", name: "CỰC KHÓ (ÁC MỘNG)", hp: "+40% Quái & Boss", col: "text-rose-400" }
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => setSelectedDifficulty(df.id)}
                  className={`px-3 py-1.5 border text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    selectedDifficulty === df.id
                      ? "bg-emerald-500/20 border-emerald-400 text-white"
                      : "bg-slate-950/60 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={df.col}>{df.name}</span>
                  <span className="text-[9.5px] text-slate-400">({df.hp})</span>
                </button>
              ))}
            </div>

            {/* 10 Maps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-y-auto max-h-[62vh] pr-1">
              {CAMPAIGN_MAPS.map((m) => {
                const isSelected = selectedMap === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSfx("click");
                      setSelectedMap(m.id);
                    }}
                    className={`border p-2.5 flex flex-col justify-between transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-950/70 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <div className="w-full h-20 bg-slate-950 overflow-hidden mb-2 border border-slate-700">
                        <img
                          src={m.img}
                          alt={m.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-extrabold uppercase">
                        {m.name}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{m.title}</div>
                      <div className="text-[9.5px] text-rose-300 mt-1">TRÙM: {m.boss}</div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                      <span>{m.waves} ĐỢT</span>
                      <span className={isSelected ? "text-emerald-400 font-bold" : ""}>
                        {isSelected ? "ĐANG CHỌN" : "CHỌN"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 2: TÁC CHIẾN CO-OP MULTIPLAYER (HOST / JOIN / PIN)
          ====================================================================== */}
      {showCoopModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-modal max-w-lg w-full p-6 flex flex-col gap-4 border border-cyan-400/60 shadow-[0_0_60px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black uppercase text-cyan-300 flex items-center gap-2">
                  <span>⚔️ TÁC CHIẾN ONLINE CO-OP (TEAM 2)</span>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    30Hz
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Kết nối 2 người chơi qua WebSocket Node.js Server
                </p>
              </div>
              <button
                onClick={() => setShowCoopModal(false)}
                className="text-slate-400 hover:text-rose-400 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            {/* Host / Join Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={handleCreateHostRoom}
                className={`flex-1 py-2 text-xs font-bold uppercase transition cursor-pointer ${
                  coopTab === "host"
                    ? "border-b-2 border-cyan-400 text-cyan-300 bg-cyan-950/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                1. TẠO PHÒNG (HOST)
              </button>
              <button
                onClick={() => setCoopTab("join")}
                className={`flex-1 py-2 text-xs font-bold uppercase transition cursor-pointer ${
                  coopTab === "join"
                    ? "border-b-2 border-cyan-400 text-cyan-300 bg-cyan-950/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                2. VÀO PHÒNG (JOIN)
              </button>
            </div>

            {/* Tab 1: HOST */}
            {coopTab === "host" && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900/80 p-3 border border-slate-800 flex flex-col gap-2">
                  <span className="text-[11px] text-slate-400 uppercase">MÃ PHÒNG (PIN CODE):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-cyan-300 tracking-widest bg-slate-950 px-4 py-2 border border-cyan-500/50 flex-1 text-center">
                      {roomCode || "ĐANG TẠO..."}
                    </span>
                    <button
                      onClick={copyRoomCode}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition cursor-pointer"
                    >
                      COPY PIN
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyDirectLink}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
                  >
                    🔗 SAO CHÉP LINK MỜI
                  </button>
                </div>

                <div className="p-3 bg-slate-900/50 border border-slate-800 text-[11px]">
                  <span className="text-slate-400">TRẠNG THÁI: </span>
                  <span className="text-amber-300 font-bold">{statusMessage}</span>
                </div>

                <button
                  onClick={handleStartCoop}
                  disabled={!peerReady && false} // Host can start or wait
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {peerReady ? "XUẤT TRẬN (2 NGƯỜI SẴN SÀNG)" : "XUẤT TRẬN (HOẶC CHỜ ĐỒNG ĐỘI)"}
                </button>
              </div>
            )}

            {/* Tab 2: JOIN */}
            {coopTab === "join" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-slate-400 uppercase">
                    NHẬP MÃ PIN PHÒNG HOẶC DÁN LINK:
                  </label>
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                    placeholder="VÍ DỤ: XENO-9842"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-cyan-300 font-black text-base uppercase focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-900/50 border border-slate-800 text-[11px]">
                  <span className="text-slate-400">TRẠNG THÁI: </span>
                  <span className="text-amber-300 font-bold">{statusMessage || "Sẵn sàng nhập mã phòng..."}</span>
                </div>

                <button
                  onClick={handleJoinRoom}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  VÀO PHÒNG CHIẾN ĐẤU
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 3: KHO SÚNG & THÔNG SỐ (ARMORY PREVIEW)
          ====================================================================== */}
      {showArmoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-modal max-w-4xl w-full max-h-[90vh] overflow-hidden p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🔫 KHO VŨ KHÍ MECHA (7 LOẠI SÚNG HD)</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px]">
                    SLOT 1 - 7
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Thông số chi tiết, độ sát thương và tầm bắn của các vũ khí
                </p>
              </div>
              <button
                onClick={() => setShowArmoryModal(false)}
                className="text-slate-400 hover:text-rose-400 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[70vh] pr-1">
              {WEAPONS_INFO.map((w, idx) => (
                <div
                  key={w.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-emerald-400 p-3 flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                        SLOT #{idx + 1}
                      </span>
                      <span className="text-[10px] text-amber-300 font-bold">{w.type}</span>
                    </div>
                    <div className="h-20 bg-slate-950 border border-slate-800 flex items-center justify-center p-2 mb-2">
                      <img src={w.img} alt={w.name} className="max-h-full object-contain" />
                    </div>
                    <div className="text-xs font-black text-white uppercase">{w.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{w.desc}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      DMG: <b className="text-emerald-400">{w.damage}</b>
                    </span>
                    <span className="text-slate-400">
                      TỐC ĐỘ: <b className="text-cyan-300">{w.rpm}</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 4: CẨM NANG VẬT THỂ & QUÁI VẬT (INTEL)
          ====================================================================== */}
      {showIntelDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-modal max-w-3xl w-full max-h-[90vh] overflow-hidden p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  📜 CẨM NANG VẬT THỂ & CHIẾN THUẬT
                </h3>
                <p className="text-[11px] text-slate-400">
                  Thông tin các trạm máy phát điện, kén ngủ đông và vật thể tương tác
                </p>
              </div>
              <button
                onClick={() => setShowIntelDrawer(false)}
                className="text-slate-400 hover:text-rose-400 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-1 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-3 border border-slate-800 flex gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-black text-amber-300 uppercase">
                    MÁY PHÁT ĐIỆN KHÔNG GIAN [GIỮ PHÍM E 5 GIÂY]
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nằm ở một phòng ngẫu nhiên trong map. Khởi động thành công sẽ bật toàn bộ đèn trạm,
                    hồi phục 100% khiên giáp và kích hoạt máy quét radar minimap.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 border border-slate-800 flex gap-3">
                <span className="text-2xl">🧬</span>
                <div>
                  <div className="font-black text-cyan-300 uppercase">
                    KÉN NGỦ ĐÔNG CRYO PODS & THÙNG DUNG DỊCH
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Bắn phá các kén ngủ đông để nhặt đạn dược, máu, giáp và tiền vàng. Hãy cẩn thận với
                    các thùng axit xanh lá có thể gây nổ diện rộng!
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 border border-slate-800 flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-black text-emerald-400 uppercase">
                    THÁP PHÁO TỰ ĐỘNG [PHÍM T]
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Triển khai tối đa 4 tháp pháo tự động nòng đôi. Tự động tìm kiếm và xả đạn tiêu diệt
                    mọi kẻ thù trong bán kính 520px.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 border border-slate-800 flex gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <div className="font-black text-sky-400 uppercase">
                    PHẢN LỰC LƯỚT NHANH [PHÍM SPACE]
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Lướt nhanh theo hướng di chuyển WASD, nhận 0.35 giây miễn nhiễm toàn bộ sát thương
                    để né tránh đòn quật đuôi của Trùm Omega!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 5: CÀI ĐẶT ĐỒ HỌA & ÂM THANH
          ====================================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-modal max-w-md w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                ⚙️ CÀI ĐẶT HỆ THỐNG
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-rose-400 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between bg-slate-900/80 p-3 border border-slate-800">
                <span className="font-bold text-slate-300">Âm thanh & Nhạc nền:</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1 font-bold cursor-pointer ${
                    soundEnabled ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {soundEnabled ? "BẬT" : "TẮT"}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 p-3 border border-slate-800">
                <span className="font-bold text-slate-300">Màu máu quái:</span>
                <button
                  onClick={() => setBloodColor(bloodColor === "red" ? "green" : "red")}
                  className={`px-3 py-1 font-bold cursor-pointer ${
                    bloodColor === "red" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {bloodColor === "red" ? "ĐỎ" : "XANH LÁ"}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 p-3 border border-slate-800">
                <span className="font-bold text-slate-300">Giới hạn FPS:</span>
                <div className="flex gap-1.5">
                  {[60, 120, 200].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFpsCap(f)}
                      className={`px-2.5 py-1 text-xs font-bold cursor-pointer ${
                        fpsCap === f
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
            >
              Lưu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
