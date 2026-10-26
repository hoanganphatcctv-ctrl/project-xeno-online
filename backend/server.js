import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi origin hoặc cấu hình URL Vercel frontend
    methods: ["GET", "POST"]
  },
  pingInterval: 8000,
  pingTimeout: 4000,
  perMessageDeflate: false,
  httpCompression: false
});

// Quản lý danh sách phòng đang hoạt động trong RAM
const rooms = new Map();

function generateRoomCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "XN";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Endpoint kiểm tra sức khỏe server (Dùng cho Render / UptimeRobot ping giữ server online)
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "Project Xeno Co-Op Game Server",
    activeRooms: rooms.size,
    uptime: Math.floor(process.uptime()) + "s"
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

io.on("connection", (socket) => {
  console.log(`[SOCKET CONNECT] User connected: ${socket.id}`);
  let currentRoomId = null;

  // 1. TẠO PHÒNG MỚI (HOST)
  socket.on("create_room", (data, callback) => {
    let requestedCode = (data?.roomCode || "").trim().toUpperCase();
    let roomCode = requestedCode && !rooms.has(requestedCode) ? requestedCode : generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const roomData = {
      code: roomCode,
      slot: data?.slot || 0,
      hostId: socket.id,
      hostName: data?.hostName || "CHỈ HUY P1",
      clientId: null,
      peerReady: false,
      state: "waiting",
      mapId: data?.mapId || 1,
      difficulty: data?.difficulty || "normal",
      createdAt: Date.now()
    };

    rooms.set(roomCode, roomData);
    currentRoomId = roomCode;
    socket.join(roomCode);

    console.log(`[ROOM CREATED] Room ${roomCode} created by Host ${socket.id}`);

    if (typeof callback === "function") {
      callback({ success: true, roomCode });
    }
  });

  // 1B. LẤY DANH SÁCH PHÒNG ĐANG HOẠT ĐỘNG TRÊN HỆ THỐNG
  socket.on("list_rooms", (callback) => {
    const list = [];
    for (const [code, r] of rooms.entries()) {
      list.push({
        roomCode: code,
        slot: r.slot || 0,
        hostName: r.hostName || "CHỈ HUY P1",
        mapId: r.mapId || 1,
        difficulty: r.difficulty || "normal",
        players: r.clientId ? 2 : 1,
        maxPlayers: 2,
        state: r.state === "in_game" ? "playing" : "waiting",
        peerReady: !!r.peerReady
      });
    }
    if (typeof callback === "function") {
      callback({ success: true, rooms: list });
    }
  });

  // 2. THAM GIA PHÒNG (CLIENT)
  socket.on("join_room", (data, callback) => {
    const targetCode = (data?.roomCode || "").trim().toUpperCase();
    const room = rooms.get(targetCode);

    if (!room) {
      if (typeof callback === "function") {
        callback({ success: false, message: "Phòng không tồn tại hoặc đã đóng." });
      }
      return;
    }

    if ((room.clientId && room.clientId !== socket.id) || room.state === "in_game") {
      if (typeof callback === "function") {
        callback({ success: false, message: "Phòng đã đủ 2/2 người hoặc đang trong trận đấu." });
      }
      return;
    }

    room.clientId = socket.id;
    room.peerReady = false;
    currentRoomId = targetCode;
    socket.join(targetCode);

    console.log(`[ROOM JOINED] Player ${socket.id} joined Room ${targetCode}`);

    // Báo cho Host biết Client đã kết nối
    io.to(room.hostId).emit("peer_connected", {
      peerId: socket.id,
      roomCode: targetCode
    });

    if (typeof callback === "function") {
      callback({
        success: true,
        roomCode: targetCode,
        isHost: false,
        mapId: room.mapId || 1,
        difficulty: room.difficulty || "normal"
      });
    }
  });

  // 2B. ĐỒNG ĐỘI XÁC NHẬN SẴN SÀNG (READY CHECK)
  socket.on("peer_ready", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.peerReady = !!(data && data.ready);
    socket.to(currentRoomId).emit("peer_ready", { ready: room.peerReady });
  });

  // 2C. HOST CẬP NHẬT BẢN ĐỒ / ĐỘ KHÓ / TẦN SỐ TRONG PHÒNG CHỜ
  socket.on("update_room_meta", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id) return;
    if (data?.mapId) room.mapId = Number(data.mapId) || 1;
    if (data?.difficulty) room.difficulty = String(data.difficulty);
    if (data?.hz) room.hz = data.hz === 60 ? 60 : 30;
  });

  // 3. HOST BẮT ĐẦU XUẤT TRẬN
  socket.on("start_mission", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id) return;

    room.state = "in_game";
    room.mapId = data?.mapId || room.mapId || 1;
    room.difficulty = data?.difficulty || room.difficulty || "normal";
    room.hz = data?.hz === 60 ? 60 : 30;

    console.log(`[MISSION START] Room ${currentRoomId} starting Map ${room.mapId} (${room.difficulty}, ${room.hz}Hz)`);

    io.to(currentRoomId).emit("mission_started", {
      mapId: room.mapId,
      difficulty: room.difficulty,
      hz: room.hz,
      startTime: Date.now()
    });
  });

  // 3B. HOST CHUYỂN MAP TIẾP THEO (CAMPAIGN PROGRESSION MAP 1 -> 10)
  socket.on("switch_map", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id) return;

    const nextMap = data?.mapId || (room.mapId < 10 ? room.mapId + 1 : 1);
    room.mapId = nextMap;
    room.state = "in_game";

    console.log(`[MAP SWITCH] Room ${currentRoomId} switched to Map ${nextMap} by Host`);

    io.to(currentRoomId).emit("map_switched", {
      mapId: nextMap,
      timestamp: Date.now()
    });
  });

  // 4. CHUYỂN TIẾP GÓI TIN 60Hz/30Hz TICK & SỰ KIỆN QUÁI VẬT HOST-AUTHORITATIVE (RELAY PACKETS)
  socket.on("sync_tick", (packet) => {
    if (!currentRoomId) return;
    // Gói tin vị trí input/snap có thể dùng volatile để giảm trễ; các sự kiện chiến đấu (bắn, sát thương, chết) gửi tin cậy
    if (packet && (packet.t === "input" || packet.t === "snap")) {
      socket.to(currentRoomId).volatile.emit("remote_tick", packet);
    } else {
      socket.to(currentRoomId).emit("remote_tick", packet);
    }
  });

  socket.on("SPAWN_ENEMY", (payload) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit("SPAWN_ENEMY", payload);
  });

  socket.on("SYNC_ENEMIES", (payload) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit("SYNC_ENEMIES", payload);
  });

  socket.on("ENEMY_HIT", (payload) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit("ENEMY_HIT", payload);
  });

  socket.on("ENEMY_DIE", (payload) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit("ENEMY_DIE", payload);
  });

  // 5. TRẠNG THÁI GỤC NGÃ (DOWNED)
  socket.on("player_down", () => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit("teammate_down");
  });

  // 6. CỨU HỒI SINH ĐỒNG ĐỘI
  socket.on("revive_success", (data) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit("teammate_revived", data);
  });

  // 7. THẤT BẠI NHIỆM VỤ (GAME OVER)
  socket.on("game_over", () => {
    if (!currentRoomId) return;
    io.to(currentRoomId).emit("mission_failed");
  });

  // 7B. KIỂM TRA ĐỘ TRỄ PING (HEARTBEAT)
  socket.on("ping_check", (callback) => {
    if (typeof callback === "function") callback();
  });

  // 8. NGẮT KẾT NỐI
  socket.on("disconnect", () => {
    console.log(`[SOCKET DISCONNECT] User disconnected: ${socket.id}`);
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);

      if (room.hostId === socket.id) {
        // Host thoát -> Thông báo cho Client và hủy phòng
        socket.to(currentRoomId).emit("peer_disconnected", { reason: "Host đã rời phòng!" });
        rooms.delete(currentRoomId);
        console.log(`[ROOM CLOSED] Room ${currentRoomId} closed because Host left`);
      } else if (room.clientId === socket.id) {
        // Client thoát -> Báo cho Host biết
        room.clientId = null;
        room.state = "waiting";
        socket.to(currentRoomId).emit("peer_disconnected", { reason: "Đồng đội đã rời phòng!" });
        console.log(`[CLIENT LEFT] Client left Room ${currentRoomId}`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 XENO CO-OP DEDICATED SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Engine: Socket.io 4.7.5`);
  console.log(`⚡ Ready for 30Hz Network Ticks & Matchmaking`);
  console.log(`====================================================`);
});



