import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.roomCode = null;
    this.isHost = false;
    this.lastTickTime = 0;
    this.tickRate = 30; // 30Hz (33.3ms)
    this.ping = 0;
    this.callbacks = new Map();
  }

  connect(serverUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) || "http://localhost:4000") {
    if (this.socket && this.connected) return;

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("[SOCKET] Connected to game server:", this.socket.id);
      this._emitEvent("status_change", { connected: true, id: this.socket.id });
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      console.log("[SOCKET] Disconnected:", reason);
      this._emitEvent("status_change", { connected: false, reason });
    });

    this.socket.on("peer_connected", (data) => {
      console.log("[SOCKET] Teammate connected:", data);
      this._emitEvent("peer_connected", data);
    });

    this.socket.on("peer_disconnected", (data) => {
      console.log("[SOCKET] Teammate disconnected:", data);
      this._emitEvent("peer_disconnected", data);
    });

    this.socket.on("mission_started", (data) => {
      console.log("[SOCKET] Mission started:", data);
      this._emitEvent("mission_started", data);
    });

    this.socket.on("map_switched", (data) => {
      console.log("[SOCKET] Map switched:", data);
      this._emitEvent("map_switched", data);
    });

    this.socket.on("remote_tick", (packet) => {
      this._emitEvent("remote_tick", packet);
    });

    this.socket.on("SPAWN_ENEMY", (payload) => {
      this._emitEvent("SPAWN_ENEMY", payload);
    });

    this.socket.on("SYNC_ENEMIES", (payload) => {
      this._emitEvent("SYNC_ENEMIES", payload);
    });

    this.socket.on("ENEMY_HIT", (payload) => {
      this._emitEvent("ENEMY_HIT", payload);
    });

    this.socket.on("ENEMY_DIE", (payload) => {
      this._emitEvent("ENEMY_DIE", payload);
    });

    this.socket.on("teammate_down", () => {
      this._emitEvent("teammate_down");
    });

    this.socket.on("teammate_revived", (data) => {
      this._emitEvent("teammate_revived", data);
    });

    this.socket.on("mission_failed", () => {
      this._emitEvent("mission_failed");
    });
  }

  createRoom(mapId = 1) {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error("Socket chưa kết nối!"));
      this.socket.emit("create_room", { mapId }, (response) => {
        if (response && response.success) {
          this.roomCode = response.roomCode;
          this.isHost = true;
          resolve(response.roomCode);
        } else {
          reject(new Error(response?.message || "Tạo phòng thất bại!"));
        }
      });
    });
  }

  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error("Socket chưa kết nối!"));
      this.socket.emit("join_room", { roomCode }, (response) => {
        if (response && response.success) {
          this.roomCode = response.roomCode;
          this.isHost = false;
          resolve(response);
        } else {
          reject(new Error(response?.message || "Không thể vào phòng!"));
        }
      });
    });
  }

  startMission(mapId = 1) {
    if (this.socket && this.isHost) {
      this.socket.emit("start_mission", { mapId });
    }
  }

  switchMap(mapId) {
    if (this.socket && this.isHost) {
      this.socket.emit("switch_map", { mapId });
    }
  }

  sendTick(packet, now = performance.now()) {
    if (!this.socket || !this.connected) return;
    if (now - this.lastTickTime < 1000 / this.tickRate) return;
    this.lastTickTime = now;
    this.socket.emit("sync_tick", packet);
  }

  sendEvent(eventName, payload) {
    if (!this.socket || !this.connected) return;
    this.socket.emit(eventName, payload);
  }

  sendPlayerDown() {
    if (this.socket && this.connected) {
      this.socket.emit("player_down");
    }
  }

  sendReviveSuccess(data) {
    if (this.socket && this.connected) {
      this.socket.emit("revive_success", data);
    }
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.callbacks.has(event)) return;
    const list = this.callbacks.get(event).filter((cb) => cb !== callback);
    this.callbacks.set(event, list);
  }

  _emitEvent(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach((cb) => cb(data));
    }
  }
}

export const socketService = new SocketService();
export default socketService;

