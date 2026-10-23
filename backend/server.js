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
  pingInterval: 10000,
  pingTimeout: 5000
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
    let roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const roomData = {
      code: roomCode,
      hostId: socket.id,
      clientId: null,
      state: "waiting",
      mapId: data?.mapId || 1,
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

  // 2. THAM GIA PHÒNG (CLIENT)
  socket.on("join_room", (data, callback) => {
    const targetCode = (data?.roomCode || "").trim().toUpperCase();
    const room = rooms.get(targetCode);

    if (!room) {
      if (typeof callback === "function") {
        callback({ success: false, message: "Phòng không tồn tại hoặc đã đóng!" });
      }
      return;
    }

    if (room.clientId && room.clientId !== socket.id) {
      if (typeof callback === "function") {
        callback({ success: false, message: "Phòng đã đủ 2 người chơi!" });
      }
      return;
    }

    room.clientId = socket.id;
    currentRoomId = targetCode;
    socket.join(targetCode);

    console.log(`[ROOM JOINED] Player ${socket.id} joined Room ${targetCode}`);

    // Báo cho Host biết Client đã kết nối
    io.to(room.hostId).emit("peer_connected", {
      peerId: socket.id,
      roomCode: targetCode
    });

    if (typeof callback === "function") {
      callback({ success: true, roomCode: targetCode, isHost: false });
    }
  });

  // 3. HOST BẮT ĐẦU XUẤT TRẬN
  socket.on("start_mission", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.hostId !== socket.id) return;

    room.state = "in_game";
    room.mapId = data?.mapId || 1;
    room.hz = data?.hz === 60 ? 60 : 30;

    console.log(`[MISSION START] Room ${currentRoomId} starting Map ${room.mapId} (${room.hz}Hz)`);

    io.to(currentRoomId).emit("mission_started", {
      mapId: room.mapId,
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

  // 4. CHUYỂN TIẾP GÓI TIN 30Hz TICK & SỰ KIỆN QUÁI VẬT HOST-AUTHORITATIVE (RELAY PACKETS)
  socket.on("sync_tick", (packet) => {
    if (!currentRoomId) return;
    // Gửi chuyển tiếp gói tin sang cho đồng đội trong phòng
    socket.to(currentRoomId).emit("remote_tick", packet);
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



