import socketService from "../network/socket";
import { cloneWeaponData } from "./weapons";
import sfx from "./audio";
import {
  ENEMY_TYPES,
  drawXenomorphMonster,
  pickEnemyTypeForWave
} from "./enemies";
import {
  getBossConfigForMap,
  createBossInstance,
  updateBossAI,
  drawBossGroundTelegraph,
  drawBossEntity
} from "./bosses";
import { WorldManager } from "./world";
import { ItemManager, activateItemPowerup } from "./items";

/**
 * PROJECT XENO: MODULAR GAME ENGINE CORE (CANVAS 2D)
 * Runs at native 60 - 200 FPS via requestAnimationFrame
 * Decoupled from Socket.io 30Hz network transmission
 * Phase 4: 5x5 Matrix World, 5s Hold-E Power Generator, Auto-Doors, Explosive Barrels & Item Drops
 */

export class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = options.mode || "solo";
    this.isHost = !!options.isHost;
    this.roomCode = options.roomCode || null;
    this.mapId = options.mapId || 1;
    this.difficulty = options.difficulty || "medium";
    this.bloodColor = options.bloodColor || "red";
    this.soundEnabled = options.soundEnabled !== false;
    this.fpsCap = options.fpsCap || 120;
    this.onGameOver = options.onGameOver || (() => {});
    this.onVictory = options.onVictory || (() => {});
    this.onToggleArmory = options.onToggleArmory || (() => {});
    this.onWeaponStateChange = options.onWeaponStateChange || (() => {});
    this.onBossStateChange = options.onBossStateChange || (() => {});
    this.onPlayerStateChange = options.onPlayerStateChange || (() => {});

    // World & Viewport Config
    this.WORLD_W = 2800;
    this.WORLD_H = 2400;
    this.camera = { x: 0, y: 0 };
    this.screenShake = 0;
    this.sfx = sfx;
    this.droneImg = new Image();
    this.droneImg.src = "/assets/drone.png";
    this.kills = 0;
    this.startTime = performance.now();
    this.frameCounter = 0;
    this.isArmoryOpen = false;

    // HD 7-Weapon Character Sprites from Original Alien Shooter Engine
    this.playerSkins = [
      {
        weaponId: 0,
        src: "/assets/sung_luc.png",
        img: null,
        loaded: false,
        pivotX: 386,
        pivotY: 213,
        scale: 0.058,
        gunLen: 39,
        flashDist: 39
      },
      {
        weaponId: 1,
        src: "/assets/short_gun.png",
        img: null,
        loaded: false,
        pivotX: 711,
        pivotY: 528,
        scale: 0.0222,
        gunLen: 39,
        flashDist: 39
      },
      {
        weaponId: 2,
        src: "/assets/gatling_gun.png",
        img: null,
        loaded: false,
        pivotX: 772,
        pivotY: 516,
        scale: 0.0265,
        gunLen: 34,
        flashDist: 36
      },
      {
        weaponId: 3,
        src: "/assets/fire_gun.png",
        img: null,
        loaded: false,
        pivotX: 555,
        pivotY: 498,
        scale: 0.0272,
        gunLen: 35,
        flashDist: 36
      },
      {
        weaponId: 4,
        src: "/assets/sung_bang.png",
        img: null,
        loaded: false,
        pivotX: 549,
        pivotY: 474,
        scale: 0.0275,
        gunLen: 35,
        flashDist: 36
      },
      {
        weaponId: 5,
        src: "/assets/phao.png",
        img: null,
        loaded: false,
        pivotX: 582,
        pivotY: 447,
        scale: 0.0260,
        gunLen: 40,
        flashDist: 42
      },
      {
        weaponId: 6,
        src: "/assets/laze_gun.png",
        img: null,
        loaded: false,
        pivotX: 558,
        pivotY: 435,
        scale: 0.0286,
        gunLen: 36,
        flashDist: 38
      }
    ];

    this.playerSkins.forEach(skin => {
      const img = new Image();
      img.onload = () => {
        skin.loaded = true;
        skin.img = img;
      };
      img.onerror = () => {
        console.warn("Failed to load weapon skin sprite:", skin.src);
      };
      img.src = skin.src;
    });

    // World & Item Systems (Phase 4)
    this.world = new WorldManager(this.WORLD_W, this.WORLD_H, this.mapId);
    this.itemManager = new ItemManager(70);
    this.globalFreezeTimer = 0;

    // Weapons Setup
    this.weapons = cloneWeaponData();
    this.weapons[0].unlocked = true;
    if (this.mapId >= 2) this.weapons[1].unlocked = true;
    if (this.mapId >= 4) this.weapons[2].unlocked = true;

    // Player 1 (Local)
    this.player = {
      x: this.WORLD_W / 2,
      y: this.WORLD_H / 2,
      angle: 0,
      hp: 100,
      maxHp: 100,
      armor: 100,
      maxArmor: 100,
      credits: 140,
      speed: 3.6,
      baseSpeed: 3.6,
      damageMultiplier: 1.0,
      vitalLevel: 1,
      speedLevel: 1,
      dmgLevel: 1,
      healCount: 0,
      droneCount: 0,
      turretCount: 0,
      hasNvg: false,
      currentWeapon: 0,
      lastShotTime: 0,
      muzzleFlash: 0,
      laserHeat: 0,
      activeLaserBeam: null,
      isDown: false,
      reviveProgress: 0,
      radius: 18,
      invulnTimer: 0,
      speedBuffTimer: 0,
      overdriveBuffTimer: 0,
      dashActiveTimer: 0,
      dashCooldown: 0,
      dashVx: 0,
      dashVy: 0,
      trailHistory: [],
      walkCycle: 0,
      isMoving: false
    };

    // Auto-Turrets System
    this.turrets = [];
    this.pendingTurretDeploy = {
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      elapsedMs: 0,
      durationMs: 3000,
      anchorX: 0,
      anchorY: 0
    };
    this.turretAsset = new Image();
    this.turretAsset.src = "/assets/phao_tu_dong.png";

    // Dynamic Sci-Fi Combat VFX (Fire Patches & Shockwaves)
    this.firePatches = [];
    this.shockwaveRings = [];

    // Player 2 (Teammate in Co-op)
    this.teammate = {
      active: this.mode === "coop",
      x: this.WORLD_W / 2 + 50,
      y: this.WORLD_H / 2 + 50,
      targetX: this.WORLD_W / 2 + 50,
      targetY: this.WORLD_H / 2 + 50,
      angle: 0,
      hp: 100,
      maxHp: 100,
      armor: 100,
      maxArmor: 100,
      credits: 120,
      currentWeapon: 0,
      lastShotTime: 0,
      muzzleFlash: 0,
      laserHeat: 0,
      activeLaserBeam: null,
      isShooting: false,
      isDown: false,
      isDashing: false,
      reviveProgress: 0,
      radius: 18,
      walkCycle: 0,
      isMoving: false
    };

    // Projectile & Particle Pools
    this.MAX_BULLETS = 700;
    this.bullets = Array.from({ length: this.MAX_BULLETS }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      damage: 0,
      color: "#fbbf24",
      size: 3,
      type: "bullet",
      knockback: 2,
      life: 0,
      maxLife: 100,
      pierce: 1,
      isHostile: false,
      isTeammate: false
    }));

    this.MAX_PARTICLES = 600;
    this.particles = Array.from({ length: this.MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: "#fde047",
      size: 2,
      life: 0,
      maxLife: 20
    }));

    this.MAX_SHELLS = 100;
    this.shells = [];
    this.floatingTexts = [];

    // Enemies & Bosses (Rule B: Managed via networkId & Map Registry)
    this.MAX_ENEMIES = 350;
    this.nextEnemyId = 1;
    this.enemiesById = new Map();
    this.lastEnemySyncTime = 0;
    this.enemySyncInterval = 80; // 12.5 Hz (within 10-15 Hz requirement)
    this.enemies = Array.from({ length: this.MAX_ENEMIES }, () => ({
      id: 0,
      active: false,
      typeKey: "crawler",
      name: "Crawler",
      x: 0,
      y: 0,
      serverX: 0,
      serverY: 0,
      vx: 0,
      vy: 0,
      targetPlayerId: "host",
      hp: 30,
      maxHp: 30,
      speed: 2.2,
      radius: 14,
      damage: 8,
      reward: 3,
      bodyColor: "#16a34a",
      carapaceColor: "#064e3b",
      eyeColor: "#ef4444",
      legs: 3,
      ranged: false,
      isElite: false,
      burstTriShot: false,
      shootCooldown: 100,
      angle: 0,
      hitFlash: 0,
      chillTimer: 0,
      burnTimer: 0,
      legPhase: 0
    }));

    this.bosses = [];
    this.bossSpawned = false;

    // Waves Progression
    this.currentWave = 1;
    this.maxWaves = 5;
    this.spawnTimer = 0;
    this.enemiesSpawnedInWave = 0;
    this.waveMaxSpawns = 25;

    // Inputs
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };

    // Fixed 60Hz Physics Time Step (Decoupled from 120Hz/144Hz/240Hz monitors)
    this.FIXED_PHYSICS_STEP = 1000 / 60; // 16.666 ms
    this.MAX_PHYSICS_TICKS_PER_FRAME = 4;
    this.loopAccumulator = 0;

    // Persistent Decal Canvas for Floor Blood Splatters, Scorch Marks & Corpses
    this.surfaceCanvas = document.createElement("canvas");
    this.surfaceCanvas.width = this.WORLD_W;
    this.surfaceCanvas.height = this.WORLD_H;
    this.surfaceCtx = this.surfaceCanvas.getContext("2d");

    // Dynamic Lighting & Flashlight Canvas (0.5 scale for optimal performance)
    this.LIGHT_SCALE = 0.5;
    this.lightCanvas = document.createElement("canvas");
    this.lightCtx = this.lightCanvas.getContext("2d");

    // Co-op Network Buffers
    this.pendingEnemyHits = [];
    this.pendingBossHits = [];
    this.pendingExplodedBarrels = [];
    this.pendingBrokenCrates = [];
    this.pendingBarrelExplodes = [];
    this.pendingCrateHits = [];
    this.pendingPickedItems = [];

    // Loop
    this.running = false;
    this.lastTime = 0;
    this.animId = null;

    if (options.previousPlayerState) {
      this.restorePersistentState(options.previousPlayerState);
    }

    this._bindEvents();
    this._bindNetwork();
    this._notifyWeaponState();
    this._notifyPlayerState();
  }

  _bindEvents() {
    this._handleKeyDown = (e) => {
      this.keys[e.code] = true;

      // 1-7 Weapon Hotkeys
      if (e.code.startsWith("Digit") || e.code.startsWith("Numpad")) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 7) {
          this.selectWeapon(num - 1);
        }
      }

      // Tactical Boss Spawn Cheat/Hotkey [KeyK]
      if (e.code === "KeyK") {
        this.spawnBossSquad();
      }

      // Open / Toggle Armory Shop [KeyB]
      if (e.code === "KeyB") {
        if (this.onToggleArmory) this.onToggleArmory();
      }

      // Tactical Spacebar Jetpack Dash [Space]
      if (e.code === "Space") {
        e.preventDefault();
        this.triggerPlayerDash();
      }

      // Deploy Auto-Turret [KeyT]
      if (e.code === "KeyT") {
        e.preventDefault();
        this.deployAutoTurret();
      }
    };

    this._handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    this._handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    };

    this._handleMouseDown = (e) => {
      if (e.button === 0 && !this.player.isDown && !this.isArmoryOpen) {
        this.mouse.down = true;
        sfx.init();
      }
    };

    this._handleMouseUp = (e) => {
      if (e.button === 0) {
        this.mouse.down = false;
        this.player.laserHeat = Math.max(0, this.player.laserHeat - 0.2);
        this.player.activeLaserBeam = null;
      }
    };

    this._handleWheel = (e) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      this.cycleWeapon(dir);
    };

    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
    window.addEventListener("mousemove", this._handleMouseMove);
    window.addEventListener("mousedown", this._handleMouseDown);
    window.addEventListener("mouseup", this._handleMouseUp);
    this.canvas.addEventListener("wheel", this._handleWheel, { passive: false });
  }

  _bindNetwork() {
    if (this.mode !== "coop") return;

    this._onRemoteTick = (packet) => {
      if (!packet) return;
      this.teammate.targetX = packet.x;
      this.teammate.targetY = packet.y;
      this.teammate.angle = packet.angle;
      this.teammate.currentWeapon = packet.weapon !== undefined ? packet.weapon : this.teammate.currentWeapon;
      this.teammate.isShooting = !!packet.shooting;
      this.teammate.isDown = !!packet.isDown;
      this.teammate.isDashing = !!packet.isDashing;
      if (typeof packet.reviveProgress === "number") {
        this.teammate.reviveProgress = packet.reviveProgress;
      }

      // Synchronize Turrets between Host and Client
      if (Array.isArray(packet.turrets)) {
        packet.turrets.forEach(rt => {
          let found = this.turrets.find(t => t.id === rt.id);
          if (!found) {
            this.turrets.push({
              id: rt.id,
              active: true,
              x: rt.x,
              y: rt.y,
              angle: rt.a,
              fireCooldown: 0,
              isRemote: true
            });
          } else {
            found.angle = rt.a;
          }
        });
      }

      // Generator synchronization
      if (packet.genActive && !this.world.generator.active) {
        this.world.generator.active = true;
        this.world.generatorOnline = true;
      }

      // Host receives hits, barrel explosions, crate damage, and item pickups from Client
      if (this.isHost) {
        if (Array.isArray(packet.enemyHits)) {
          packet.enemyHits.forEach(h => {
            const e = (h.id !== undefined && this.enemiesById.get(h.id)) || this.enemies[h.i];
            if (e && e.active) {
              this.damageEnemy(e, h.dmg, h.kx || 0, h.ky || 0, h.t || "bullet", h.attackerId || "client");
            }
          });
        }
        if (Array.isArray(packet.bossHits)) {
          packet.bossHits.forEach(bh => {
            const b = this.bosses[bh.i];
            if (b && b.active) {
              this.damageBoss(b, bh.dmg, bh.t || "bullet");
            }
          });
        }
        if (Array.isArray(packet.barrelExplodes)) {
          packet.barrelExplodes.forEach(id => {
            const b = this.world.barrels[id];
            if (b && b.active) {
              this.world.explodeBarrel(b, this);
            }
          });
        }
        if (Array.isArray(packet.crateHits)) {
          packet.crateHits.forEach(ch => {
            const c = this.world.crates[ch.i];
            if (c && c.active) {
              this.world.damageCrate(c, ch.dmg, this);
            }
          });
        }
        if (Array.isArray(packet.pickedItems)) {
          packet.pickedItems.forEach(id => {
            const it = this.itemManager.items[id];
            if (it && it.active) {
              it.active = false;
              if (it.kind === "freeze") {
                this.globalFreezeTimer = 5 * 60;
                if (this.sfx) this.sfx.playFreeze();
              } else if (it.kind === "nuke") {
                this.triggerNuke();
              }
            }
          });
        }
      }

      // Client updates Wave, Boss squad, Barrels, Crates & Items from Host
      if (!this.isHost) {
        if (packet.wave !== undefined) {
          this.currentWave = packet.wave;
        }
        if (Array.isArray(packet.enemies)) {
          this._syncEnemiesFromHost(packet.enemies);
        }
        if (Array.isArray(packet.bosses)) {
          this._syncBossesFromHost(packet.bosses);
        }
        if (Array.isArray(packet.explodedBarrels)) {
          packet.explodedBarrels.forEach(id => {
            const b = this.world.barrels[id];
            if (b && b.active) {
              this.world.explodeBarrel(b, this);
            }
          });
        }
        if (Array.isArray(packet.brokenCrates)) {
          packet.brokenCrates.forEach(id => {
            const c = this.world.crates[id];
            if (c && c.active) {
              c.active = false;
              if (this.sfx) this.sfx.playNoise(0.1, 450, 0.2);
              for (let s = 0; s < 8; s++) {
                this.spawnParticle(
                  c.x + c.w * 0.5,
                  c.y + c.h * 0.5,
                  (Math.random() - 0.5) * 5,
                  (Math.random() - 0.5) * 5,
                  "#78350f",
                  3,
                  15
                );
              }
            }
          });
        }
        if (Array.isArray(packet.items)) {
          this.itemManager.syncFromHost(packet.items);
        }
      }
    };

    this._onSpawnEnemy = (payload) => {
      if (!this.isHost && payload) {
        this._spawnEnemyFromHostPayload(payload);
      }
    };

    this._onSyncEnemies = (payload) => {
      if (!this.isHost && payload) {
        if (payload.wave !== undefined) this.currentWave = payload.wave;
        if (Array.isArray(payload.enemies)) {
          this._syncEnemiesFromHost(payload.enemies);
        }
      }
    };

    this._onEnemyHit = (payload) => {
      if (this.isHost && payload) {
        const e = this.enemiesById.get(payload.id);
        if (e && e.active) {
          this.damageEnemy(
            e,
            Number(payload.damage) || 0,
            Number(payload.kx) || 0,
            Number(payload.ky) || 0,
            payload.bulletType || "bullet",
            payload.attackerId || "client"
          );
        }
      }
    };

    this._onEnemyDie = (payload) => {
      if (!this.isHost && payload) {
        this._handleClientEnemyDie(payload);
      }
    };

    this._onTeammateDown = () => {
      this.teammate.isDown = true;
      if (this.player.isDown) {
        this.triggerGameOver();
      }
    };

    this._onTeammateRevived = (data) => {
      this.player.isDown = false;
      this.player.hp = data?.hp || 40;
      this.player.armor = data?.armor || 25;
      this.player.reviveProgress = 0;
    };

    socketService.on("remote_tick", this._onRemoteTick);
    socketService.on("SPAWN_ENEMY", this._onSpawnEnemy);
    socketService.on("SYNC_ENEMIES", this._onSyncEnemies);
    socketService.on("ENEMY_HIT", this._onEnemyHit);
    socketService.on("ENEMY_DIE", this._onEnemyDie);
    socketService.on("teammate_down", this._onTeammateDown);
    socketService.on("teammate_revived", this._onTeammateRevived);
  }

  _syncBossesFromHost(remoteBosses) {
    if (!this.bossSpawned && remoteBosses.length > 0) {
      this.bossSpawned = true;
    }

    remoteBosses.forEach((rb, idx) => {
      let b = this.bosses[idx];
      if (!b) {
        b = createBossInstance(this.mapId, idx, remoteBosses.length, rb.x, rb.y);
        this.bosses[idx] = b;
      }
      b.active = rb.act === 1;
      b.x = rb.x;
      b.y = rb.y;
      b.hp = rb.hp;
      b.shield = rb.shield;
      b.angle = rb.a;
      b.enraged = rb.enraged === 1;
      b.skillState = rb.st;
      b.skillType = rb.ty;
    });

    this._notifyBossState();

    // Check victory condition on Client
    if (this.bossSpawned && remoteBosses.length > 0) {
      const allDefeated = remoteBosses.every(rb => rb.act === 0 || rb.hp <= 0);
      if (allDefeated && this.running) {
        this.triggerVictory();
      }
    }
  }

  _pickTargetPlayerId(ex, ey) {
    if (this.mode !== "coop" || !this.teammate.active) return "host";
    if (this.player.isDown && !this.teammate.isDown) return "client";
    if (this.teammate.isDown && !this.player.isDown) return "host";
    const dHost = Math.hypot(ex - this.player.x, ey - this.player.y);
    const dClient = Math.hypot(ex - this.teammate.x, ey - this.teammate.y);
    return dClient < dHost ? "client" : "host";
  }

  _resolveTargetPlayerPos(targetPlayerId) {
    if (this.mode !== "coop" || !this.teammate.active) return this.player;
    if (this.isHost) {
      return targetPlayerId === "client" ? this.teammate : this.player;
    }
    return targetPlayerId === "client" ? this.player : this.teammate;
  }

  _spawnEnemyFromHostPayload(data) {
    if (!data || !data.id) return null;
    let e = this.enemiesById.get(data.id);
    if (!e) {
      for (let i = 0; i < this.MAX_ENEMIES; i++) {
        if (!this.enemies[i].active) {
          e = this.enemies[i];
          break;
        }
      }
    }
    if (!e) return null;
    const typeKey = data.type || "crawler";
    const cfg = ENEMY_TYPES[typeKey] || ENEMY_TYPES.crawler;
    e.id = data.id;
    e.active = true;
    e.typeKey = typeKey;
    e.name = cfg.name;
    e.x = Number(data.x) || 0;
    e.y = Number(data.y) || 0;
    e.serverX = e.x;
    e.serverY = e.y;
    e.vx = Number(data.vx) || 0;
    e.vy = Number(data.vy) || 0;
    e.hp = Number(data.hp) || cfg.hp;
    e.maxHp = Number(data.maxHp) || e.hp;
    e.speed = Number(data.speed) || cfg.speed;
    e.radius = cfg.radius;
    e.damage = cfg.damage;
    e.reward = cfg.reward;
    e.bodyColor = cfg.bodyColor;
    e.carapaceColor = cfg.carapaceColor;
    e.eyeColor = cfg.eyeColor;
    e.legs = cfg.legs;
    e.ranged = cfg.ranged;
    e.isElite = !!cfg.isElite;
    e.burstTriShot = !!cfg.burstTriShot;
    e.targetPlayerId = data.targetPlayerId || "host";
    const tPos = this._resolveTargetPlayerPos(e.targetPlayerId);
    e.angle = Math.atan2(tPos.y - e.y, tPos.x - e.x);
    e.hitFlash = 0;
    e.chillTimer = 0;
    e.burnTimer = 0;
    e.legPhase = Math.random() * Math.PI * 2;
    this.enemiesById.set(e.id, e);
    return e;
  }

  _handleClientEnemyDie(data) {
    if (!data || !data.id) return;
    const e = this.enemiesById.get(data.id);
    if (e && e.active) {
      if (typeof data.x === "number") e.x = data.x;
      if (typeof data.y === "number") e.y = data.y;
      e.active = false;
      this.enemiesById.delete(data.id);
      this.kills++;
      const reward = Number(data.reward) || e.reward || 3;
      if (data.killerId === "client") {
        this.player.credits += reward;
        this.addFloatingText(e.x, e.y - 15, `+$${reward}`, "#fbbf24");
      } else {
        this.addFloatingText(e.x, e.y - 15, `ĐỒNG ĐỘI TIÊU DIỆT`, "#38bdf8");
      }
      sfx.playMonsterDeath(false);
      this.bakeAlienCorpse(e, !!data.isFrozen);
      this._notifyPlayerState();
      for (let s = 0; s < 14; s++) {
        this.spawnParticle(e.x, e.y, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, "#dc2626", 3.2, 24);
      }
    }
    if (data.dropItem && data.dropItem.kind) {
      this.itemManager.spawnDrop(data.dropItem.x, data.dropItem.y, data.dropItem.kind);
    }
  }

  _syncEnemiesFromHost(remoteEnemies) {
    const seenIds = new Set();
    for (let k = 0; k < remoteEnemies.length; k++) {
      const re = remoteEnemies[k];
      const netId = re.id !== undefined ? re.id : re.i;
      if (netId === undefined) continue;
      seenIds.add(netId);

      let e = this.enemiesById.get(netId);
      if (!e || !e.active) {
        e = this._spawnEnemyFromHostPayload({
          id: netId,
          type: re.type || re.t || "crawler",
          x: re.x,
          y: re.y,
          vx: re.vx || 0,
          vy: re.vy || 0,
          hp: re.hp,
          maxHp: re.maxHp || re.mhp,
          targetPlayerId: re.targetPlayerId || "host"
        });
        if (!e) continue;
      } else {
        // Rule C: Update authoritative serverX / serverY & velocity without hard-snapping e.x = serverX
        e.serverX = re.x;
        e.serverY = re.y;
        e.vx = typeof re.vx === "number" ? re.vx : 0;
        e.vy = typeof re.vy === "number" ? re.vy : 0;
        e.targetPlayerId = re.targetPlayerId || e.targetPlayerId || "host";
        if (typeof re.hp === "number") e.hp = re.hp;
        if (typeof re.maxHp === "number" || typeof re.mhp === "number") {
          e.maxHp = re.maxHp || re.mhp;
        }
      }
    }

    // Reconcile any stale enemies no longer present on Host
    for (const [id, e] of this.enemiesById.entries()) {
      if (!seenIds.has(id)) {
        if (e.active) {
          this.bakeAlienCorpse(e, e.chillTimer > 0);
          e.active = false;
        }
        this.enemiesById.delete(id);
      }
    }
  }

  selectWeapon(index) {
    if (index < 0 || index >= this.weapons.length) return;
    const w = this.weapons[index];
    if (!w.unlocked || w.ammo <= 0) {
      sfx.playError();
      return;
    }
    this.player.currentWeapon = index;
    this.player.laserHeat = 0;
    this.player.activeLaserBeam = null;
    sfx.playClick();
    this._notifyWeaponState();
  }

  cycleWeapon(direction) {
    let nextIdx = this.player.currentWeapon;
    const total = this.weapons.length;
    for (let i = 0; i < total; i++) {
      nextIdx = (nextIdx + direction + total) % total;
      if (this.weapons[nextIdx].unlocked && this.weapons[nextIdx].ammo > 0) {
        this.selectWeapon(nextIdx);
        return;
      }
    }
  }

  _notifyWeaponState() {
    this.onWeaponStateChange({
      currentWeapon: this.player.currentWeapon,
      weapon: this.weapons[this.player.currentWeapon],
      weapons: this.weapons.map(w => ({
        id: w.id,
        key: w.key,
        name: w.name,
        shortName: w.shortName,
        unlocked: w.unlocked,
        ammo: w.ammo,
        maxAmmo: w.maxAmmo,
        cost: w.cost,
        type: w.type,
        icon: w.icon
      }))
    });
  }

  _notifyBossState() {
    if (!this.bossSpawned || this.bosses.length === 0) {
      this.onBossStateChange({ active: false });
      return;
    }

    const alive = this.bosses.filter(b => b.active && b.hp > 0);
    const totalHp = alive.reduce((acc, b) => acc + Math.max(0, b.hp), 0);
    const maxHp = this.bosses.reduce((acc, b) => acc + b.maxHp, 0);
    const totalShield = alive.reduce((acc, b) => acc + (b.shield || 0), 0);
    const hasEnraged = alive.some(b => b.enraged);
    const statusText = alive[0]?.statusText || "Đang truy sát mục tiêu...";

    this.onBossStateChange({
      active: alive.length > 0,
      title: this.bosses[0]?.title || "CHÚA TỂ XENOMORPH",
      aliveCount: alive.length,
      totalBosses: this.bosses.length,
      totalHp,
      maxHp,
      totalShield,
      hasEnraged,
      statusText
    });
  }

  _notifyPlayerState() {
    this.onPlayerStateChange({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      armor: this.player.armor,
      maxArmor: this.player.maxArmor,
      credits: this.player.credits,
      speedBuff: this.player.speedBuffTimer > 0,
      overdriveBuff: this.player.overdriveBuffTimer > 0,
      dashCooldown: this.player.dashCooldown || 0,
      maxDashCooldown: 165,
      dashReady: (this.player.dashCooldown || 0) <= 0 && !this.player.isDown,
      turretCount: this.player.turretCount || 0,
      activeTurrets: this.turrets.filter(t => t.active).length,
      maxTurrets: 4
    });
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    sfx.init();
    sfx.playBgm("ingame");
    this._loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    sfx.stopBgm();

    window.removeEventListener("keydown", this._handleKeyDown);
    window.removeEventListener("keyup", this._handleKeyUp);
    window.removeEventListener("mousemove", this._handleMouseMove);
    window.removeEventListener("mousedown", this._handleMouseDown);
    window.removeEventListener("mouseup", this._handleMouseUp);
    this.canvas.removeEventListener("wheel", this._handleWheel);

    if (this.mode === "coop") {
      socketService.off("remote_tick", this._onRemoteTick);
      socketService.off("SPAWN_ENEMY", this._onSpawnEnemy);
      socketService.off("SYNC_ENEMIES", this._onSyncEnemies);
      socketService.off("ENEMY_HIT", this._onEnemyHit);
      socketService.off("ENEMY_DIE", this._onEnemyDie);
      socketService.off("teammate_down", this._onTeammateDown);
      socketService.off("teammate_revived", this._onTeammateRevived);
    }
  }

  _loop(now) {
    if (!this.running) return;

    try {
      const elapsed = Math.min(100, now - this.lastTime);
      this.lastTime = now;
      this.loopAccumulator += elapsed;

      let ticks = 0;
      while (this.loopAccumulator >= this.FIXED_PHYSICS_STEP && ticks < this.MAX_PHYSICS_TICKS_PER_FRAME) {
        this.update(this.FIXED_PHYSICS_STEP, now);
        this.loopAccumulator -= this.FIXED_PHYSICS_STEP;
        ticks++;
      }
      if (ticks >= this.MAX_PHYSICS_TICKS_PER_FRAME) {
        this.loopAccumulator = 0;
      }

      this.render();

      // 30Hz Co-Op Network Packet Transmission + 12.5Hz (80ms) SYNC_ENEMIES Batching
      if (this.mode === "coop") {
        const packet = {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          angle: Number(this.player.angle.toFixed(2)),
          weapon: this.player.currentWeapon,
          shooting: this.mouse.down ? 1 : 0,
          isDown: this.player.isDown ? 1 : 0,
          isDashing: (this.player.dashActiveTimer || 0) > 0 ? 1 : 0,
          reviveProgress: Number((this.player.reviveProgress || 0).toFixed(2)),
          genActive: this.world.generator.active ? 1 : 0,
          turrets: this.turrets.filter(t => t.active).map(t => ({
            id: t.id,
            x: Math.round(t.x),
            y: Math.round(t.y),
            a: Number(t.angle.toFixed(2))
          }))
        };

        if (this.isHost) {
          packet.wave = this.currentWave;

          // Rule C: Host batches SYNC_ENEMIES every 80ms (~12.5 Hz)
          if (!this.lastEnemySyncTime || (now - this.lastEnemySyncTime) >= this.enemySyncInterval) {
            this.lastEnemySyncTime = now;
            const syncedEnemies = [];
            for (const [id, e] of this.enemiesById.entries()) {
              if (!e || !e.active) continue;
              syncedEnemies.push({
                id,
                type: e.typeKey,
                x: Math.round(e.x),
                y: Math.round(e.y),
                vx: Number((e.vx || 0).toFixed(2)),
                vy: Number((e.vy || 0).toFixed(2)),
                hp: Math.round(e.hp),
                maxHp: e.maxHp,
                targetPlayerId: e.targetPlayerId || "host"
              });
            }
            socketService.sendEvent("SYNC_ENEMIES", {
              wave: this.currentWave,
              enemies: syncedEnemies
            });
          }

          if (this.bossSpawned) {
            packet.bosses = this.bosses.map(b => ({
              act: b.active ? 1 : 0,
              hp: Math.round(b.hp),
              shield: Math.round(b.shield || 0),
              x: Math.round(b.x),
              y: Math.round(b.y),
              a: Number(b.angle.toFixed(2)),
              enraged: b.enraged ? 1 : 0,
              st: b.skillState,
              ty: b.skillType
            }));
          }

          // Synchronize Barrels, Crates & Items
          if (this.pendingExplodedBarrels.length > 0) {
            packet.explodedBarrels = this.pendingExplodedBarrels.splice(0);
          }
          if (this.pendingBrokenCrates.length > 0) {
            packet.brokenCrates = this.pendingBrokenCrates.splice(0);
          }
          packet.items = this.itemManager.collectActiveItems();
        } else {
          // Client sending pending boss hits, explosions and pickups to Host
          if (this.pendingBossHits.length > 0) {
            packet.bossHits = this.pendingBossHits.splice(0);
          }
          if (this.pendingBarrelExplodes.length > 0) {
            packet.barrelExplodes = this.pendingBarrelExplodes.splice(0);
          }
          if (this.pendingCrateHits.length > 0) {
            packet.crateHits = this.pendingCrateHits.splice(0);
          }
          if (this.pendingPickedItems.length > 0) {
            packet.pickedItems = this.pendingPickedItems.splice(0);
          }
        }

        socketService.sendTick(packet, now);
      }
    } catch (err) {
      console.error("GameEngine loop error:", err);
    }

    if (this.running) {
      this.animId = requestAnimationFrame((t) => this._loop(t));
    }
  }

  spawnEnemy(forcedType = null) {
    // Rule A: Client NEVER spawns enemies autonomously
    if (this.mode === "coop" && !this.isHost) return null;

    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      const e = this.enemies[i];
      if (!e.active) {
        const typeKey = forcedType || pickEnemyTypeForWave(this.currentWave);
        const cfg = ENEMY_TYPES[typeKey] || ENEMY_TYPES.crawler;

        const ang = Math.random() * Math.PI * 2;
        const dist = 600 + Math.random() * 400;
        e.id = this.nextEnemyId++;
        e.x = Math.max(60, Math.min(this.WORLD_W - 60, this.player.x + Math.cos(ang) * dist));
        e.y = Math.max(60, Math.min(this.WORLD_H - 60, this.player.y + Math.sin(ang) * dist));
        e.serverX = e.x;
        e.serverY = e.y;
        e.vx = 0;
        e.vy = 0;

        e.active = true;
        e.typeKey = typeKey;
        e.name = cfg.name;
        e.hp = cfg.hp;
        e.maxHp = cfg.hp;
        e.speed = cfg.speed * (0.95 + Math.random() * 0.15);
        e.radius = cfg.radius;
        e.damage = cfg.damage;
        e.reward = cfg.reward;
        e.bodyColor = cfg.bodyColor;
        e.carapaceColor = cfg.carapaceColor;
        e.eyeColor = cfg.eyeColor;
        e.legs = cfg.legs;
        e.ranged = cfg.ranged;
        e.isElite = !!cfg.isElite;
        e.burstTriShot = !!cfg.burstTriShot;
        e.shootCooldown = 80 + Math.random() * 60;
        e.targetPlayerId = this._pickTargetPlayerId(e.x, e.y);
        const tPos = this._resolveTargetPlayerPos(e.targetPlayerId);
        e.angle = Math.atan2(tPos.y - e.y, tPos.x - e.x);
        e.hitFlash = 0;
        e.chillTimer = 0;
        e.burnTimer = 0;
        e.legPhase = Math.random() * Math.PI * 2;

        this.enemiesById.set(e.id, e);
        if (this.mode === "coop" && this.isHost) {
          socketService.sendEvent("SPAWN_ENEMY", {
            id: e.id,
            type: e.typeKey,
            x: Math.round(e.x),
            y: Math.round(e.y),
            hp: e.hp,
            maxHp: e.maxHp,
            speed: Number(e.speed.toFixed(2)),
            targetPlayerId: e.targetPlayerId
          });
        }
        return e;
      }
    }
    return null;
  }

  spawnBossSquad() {
    if (this.mode === "coop" && !this.isHost) return;
    if (this.bossSpawned) return;
    this.bossSpawned = true;

    const cfg = getBossConfigForMap(this.mapId);
    this.bosses = [];

    for (let i = 0; i < cfg.bossCount; i++) {
      const boss = createBossInstance(this.mapId, i, cfg.bossCount, this.player.x, this.player.y);
      this.bosses.push(boss);
    }

    sfx.playBossWarning();
    this.screenShake = 22;
    this.addFloatingText(this.player.x, this.player.y - 60, `⚠️ CẢNH BÁO: ${cfg.title} XUẤT HIỆN!`, "#f43f5e");
    this._notifyBossState();
  }

  spawnBullet(x, y, angle, weapon, isHostile = false, isTeammate = false) {
    for (let i = 0; i < this.MAX_BULLETS; i++) {
      const b = this.bullets[i];
      if (!b.active) {
        b.active = true;
        b.x = x;
        b.y = y;
        b.vx = Math.cos(angle) * (weapon.speed || 18);
        b.vy = Math.sin(angle) * (weapon.speed || 18);
        b.damage = weapon.damage || 15;
        b.color = weapon.color || (isHostile ? "#f43f5e" : "#fbbf24");
        b.size = Math.max(2, weapon.size || 3.5);
        b.type = weapon.type || "bullet";
        b.knockback = weapon.knockback || 2;
        b.life = weapon.life || (b.type === "flame" ? 35 : 110);
        b.maxLife = b.life;
        b.pierce = weapon.pierce || (weapon.type === "plasma" ? 5 : (weapon.type === "cryo" ? 2 : 1));
        b.isHostile = isHostile;
        b.isTeammate = isTeammate;
        return b;
      }
    }
    return null;
  }

  spawnParticle(x, y, vx, vy, color, size = 2.5, life = 15) {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.color = color;
        p.size = size;
        p.life = life;
        p.maxLife = life;
        return;
      }
    }
  }

  spawnShell(x, y, angle) {
    if (this.shells.length >= this.MAX_SHELLS) this.shells.shift();
    this.shells.push({
      x,
      y,
      angle: angle + (Math.random() - 0.5) * 0.4,
      alpha: 1.0,
      life: 240
    });
  }

  addFloatingText(x, y, text, color = "#38bdf8") {
    this.floatingTexts.push({ x, y, text, color, life: 54 });
  }

  spawnShockwave(x, y, color = "#f97316", maxR = 180) {
    this.shockwaveRings.push({
      x: Math.round(x),
      y: Math.round(y),
      r: 12,
      maxR: maxR,
      color: color,
      alpha: 0.95
    });
  }

  spawnFirePatch(x, y, radius = 55, duration = 240, isOilFire = false) {
    if (this.firePatches.length >= 24) this.firePatches.shift();
    this.firePatches.push({
      x: Math.round(x),
      y: Math.round(y),
      radius: radius,
      life: duration,
      maxLife: duration,
      isOilFire: isOilFire,
      phase: Math.random() * Math.PI * 2
    });
  }

  damagePlayer(amount) {
    if (this.player.isDown || this.player.invulnTimer > 0 || (this.player.dashActiveTimer || 0) > 0) return;

    this.player.invulnTimer = 20;
    this.screenShake = Math.min(15, this.screenShake + 6);

    if (this.player.armor > 0) {
      if (this.player.armor >= amount) {
        this.player.armor -= amount;
        amount = 0;
      } else {
        amount -= this.player.armor;
        this.player.armor = 0;
      }
      sfx.playArmorHit();
    }

    if (amount > 0) {
      this.player.hp = Math.max(0, this.player.hp - amount);
      if (this.player.hp <= 0) {
        this.player.isDown = true;
        socketService.sendPlayerDown();
        sfx.playSample("male_death", 0.95);
        this.addFloatingText(this.player.x, this.player.y - 30, "ĐÃ GỤC NGÃ!", "#f43f5e");
        if (!this.teammate.active || this.teammate.isDown) {
          this.triggerGameOver();
        }
      }
    }
    this._notifyPlayerState();
  }

  firePlayerWeapon(now) {
    if (this.player.isDown) return;
    const w = this.weapons[this.player.currentWeapon];
    if (!w || now - this.player.lastShotTime < w.fireRate) return;

    if (w.ammo <= 0 && this.player.overdriveBuffTimer <= 0) {
      this.player.laserHeat = 0;
      this.player.activeLaserBeam = null;
      sfx.playSample("null_click", 0.65);
      this.selectWeapon(0);
      return;
    }

    this.player.lastShotTime = now;
    if (w.ammo !== Infinity && this.player.overdriveBuffTimer <= 0) {
      w.ammo = Math.max(0, w.ammo - 1);
      this._notifyWeaponState();
    }

    this.player.muzzleFlash = 4;
    this.screenShake = Math.min(14, this.screenShake + w.shake);
    sfx.playShoot(w.type, w.id);

    const gunLen = w.id === 5 ? 38 : (w.id === 2 ? 34 : 26);
    const muzzleX = this.player.x + Math.cos(this.player.angle) * gunLen;
    const muzzleY = this.player.y + Math.sin(this.player.angle) * gunLen;

    // Laser Beam Firing & Continuous Raycast
    if (w.type === "laser") {
      this.player.laserHeat = Math.min(1.0, (this.player.laserHeat || 0) + 0.055);
      const beamHalfWidth = 6.5 + this.player.laserHeat * 8.5;
      const maxRange = w.maxRange || 980;

      // Raycast against walls
      const dirX = Math.cos(this.player.angle);
      const dirY = Math.sin(this.player.angle);
      let endX = muzzleX;
      let endY = muzzleY;

      for (let d = 16; d <= maxRange; d += 16) {
        const tx = muzzleX + dirX * d;
        const ty = muzzleY + dirY * d;
        if (this.world.pointHitsWall(tx, ty)) {
          endX = tx;
          endY = ty;
          break;
        }
        endX = tx;
        endY = ty;
      }

      this.player.activeLaserBeam = {
        x1: muzzleX,
        y1: muzzleY,
        x2: endX,
        y2: endY,
        heat: this.player.laserHeat,
        width: beamHalfWidth,
        timer: 5
      };

      const overdrive = this.player.overdriveBuffTimer > 0 ? 2.0 : 1.0;
      const laserDmg = (w.damage * 0.28 * overdrive) * (1.0 + this.player.laserHeat * 0.85);
      this._damageEntitiesAlongBeam(muzzleX, muzzleY, endX, endY, beamHalfWidth, laserDmg, "laser");
      return;
    }

    // Pellets Spawning
    const overdrive = this.player.overdriveBuffTimer > 0 ? 2.0 : 1.0;
    const effectiveWeapon = { ...w, damage: w.damage * overdrive };

    for (let i = 0; i < w.pellets; i++) {
      const spreadAng = this.player.angle + (Math.random() - 0.5) * w.spread;
      let bx = muzzleX;
      let by = muzzleY;

      if (w.id === 0) {
        const side = i === 0 ? -6 : 6;
        bx += Math.cos(this.player.angle + Math.PI / 2) * side;
        by += Math.sin(this.player.angle + Math.PI / 2) * side;
      }
      this.spawnBullet(bx, by, spreadAng, effectiveWeapon, false, false);
    }

    if (w.ejectShells) {
      const sAng = this.player.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      this.spawnShell(this.player.x + Math.cos(sAng) * 16, this.player.y + Math.sin(sAng) * 16, sAng);
    }
  }

  _damageEntitiesAlongBeam(x1, y1, x2, y2, beamWidth, damage, bulletType) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const lenSq = vx * vx + vy * vy || 1;

    // Check Barrels along laser
    this.world.barrels.forEach(b => {
      if (!b.active) return;
      const wx = b.x - x1;
      const wy = b.y - y1;
      const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      if (Math.hypot(b.x - px, b.y - py) <= b.radius + beamWidth) {
        if (!this.isHost && this.mode === "coop" && b.id !== undefined) {
          this.pendingBarrelExplodes.push(b.id);
        }
        this.world.explodeBarrel(b, this);
      }
    });

    // Check Crates along laser
    this.world.crates.forEach(c => {
      if (!c.active) return;
      const wx = c.x + c.w * 0.5 - x1;
      const wy = c.y + c.h * 0.5 - y1;
      const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      if (Math.hypot(c.x + c.w * 0.5 - px, c.y + c.h * 0.5 - py) <= 24 + beamWidth) {
        if (!this.isHost && this.mode === "coop" && c.id !== undefined) {
          this.pendingCrateHits.push({ i: c.id, dmg: damage });
        }
        this.world.damageCrate(c, damage, this);
      }
    });

    // Check Enemies along laser
    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      const e = this.enemies[i];
      if (!e.active) continue;

      const wx = e.x - x1;
      const wy = e.y - y1;
      const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      const dist = Math.hypot(e.x - px, e.y - py);

      if (dist <= e.radius + beamWidth) {
        this.damageEnemy(e, damage, 0, 0, bulletType);
      }
    }

    // Check Bosses along laser
    for (let b = 0; b < this.bosses.length; b++) {
      const boss = this.bosses[b];
      if (!boss.active || boss.hp <= 0) continue;

      const wx = boss.x - x1;
      const wy = boss.y - y1;
      const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      const dist = Math.hypot(boss.x - px, boss.y - py);

      if (dist <= boss.radius + beamWidth) {
        this.damageBoss(boss, damage, bulletType);
      }
    }
  }

  fireTeammateWeapon(now) {
    if (!this.teammate.active || this.teammate.isDown || !this.teammate.isShooting) {
      this.teammate.activeLaserBeam = null;
      return;
    }

    const tw = this.weapons[this.teammate.currentWeapon] || this.weapons[0];
    if (now - this.teammate.lastShotTime < tw.fireRate) return;

    this.teammate.lastShotTime = now;
    this.teammate.muzzleFlash = 4;

    const tMuzzleX = this.teammate.x + Math.cos(this.teammate.angle) * 28;
    const tMuzzleY = this.teammate.y + Math.sin(this.teammate.angle) * 28;

    if (tw.type === "laser") {
      const maxRange = tw.maxRange || 900;
      this.teammate.activeLaserBeam = {
        x1: tMuzzleX,
        y1: tMuzzleY,
        x2: tMuzzleX + Math.cos(this.teammate.angle) * maxRange,
        y2: tMuzzleY + Math.sin(this.teammate.angle) * maxRange,
        heat: 0.5,
        width: 6.5,
        timer: 5,
        isTeammate: true
      };
      sfx.playShoot("laser", 6);
      return;
    }

    for (let i = 0; i < tw.pellets; i++) {
      const spreadAng = this.teammate.angle + (Math.random() - 0.5) * tw.spread;
      this.spawnBullet(tMuzzleX, tMuzzleY, spreadAng, tw, false, true);
    }
    sfx.playShoot(tw.type, this.teammate.currentWeapon);
  }

  bakeBloodSplatter(x, y, radius, intensity = 1) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const safeR = Math.max(6, radius || 12);
    const ctx = this.surfaceCtx;
    ctx.save();
    ctx.translate(x, y);
    const drops = Math.floor((5 + Math.random() * 6) * intensity);
    const isGreenBlood = this.bloodColor === "green";
    for (let i = 0; i < drops; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * safeR * 1.45;
      const r = 1.8 + Math.random() * (safeR * 0.35);
      if (isGreenBlood) {
        ctx.fillStyle = Math.random() > 0.4 ? "#22c55e" : (Math.random() > 0.5 ? "#16a34a" : "#15803d");
      } else {
        ctx.fillStyle = Math.random() > 0.4 ? "#dc2626" : (Math.random() > 0.5 ? "#991b1b" : "#7f1d1d");
      }
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  bakeScorchCrater(x, y, radius, isNuclearGreen = false) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const safeR = Math.max(12, radius || 32);
    const ctx = this.surfaceCtx;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 2, x, y, safeR);
    if (isNuclearGreen) {
      g.addColorStop(0, "rgba(34, 197, 94, 0.65)");
      g.addColorStop(0.55, "rgba(21, 128, 61, 0.35)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      g.addColorStop(0, "rgba(8, 8, 12, 0.85)");
      g.addColorStop(0.55, "rgba(28, 25, 23, 0.45)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, safeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  bakeAlienCorpse(e, frozenShatter = false) {
    if (!e || !Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
    const r = Math.max(8, e.radius || 14);
    const ctx = this.surfaceCtx;
    this.bakeBloodSplatter(e.x, e.y, r * (e.isBoss ? 2.2 : 1.5), e.isBoss ? 3.0 : 1.4);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate((e.angle || 0) + (Math.random() - 0.5) * 0.4);

    const limbColor = frozenShatter ? "#38bdf8" : (e.carapaceColor || "#064e3b");
    const bodyCol = frozenShatter ? "#0284c7" : (e.bodyColor || "#16a34a");
    const spikeCol = frozenShatter ? "#bae6fd" : "#e2e8f0";

    ctx.strokeStyle = limbColor;
    ctx.lineWidth = Math.max(2, r * 0.18);
    ctx.lineCap = "round";

    // Broken chitinous legs
    for (let side = -1; side <= 1; side += 2) {
      for (let l = -1; l <= 1; l++) {
        const jx = l * r * 0.48;
        const jy = side * r * 1.02;
        const tx = jx - r * 0.42;
        const ty = side * r * 1.55;
        ctx.beginPath();
        ctx.moveTo(l * r * 0.2, side * r * 0.25);
        ctx.lineTo(jx, jy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.fillStyle = spikeCol;
        ctx.beginPath();
        ctx.moveTo(jx, jy);
        ctx.lineTo(jx + r * 0.18, jy + side * r * 0.26);
        ctx.lineTo(jx - r * 0.10, jy + side * r * 0.06);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Carapace plate shell
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.moveTo(r * 0.95, 0);
    ctx.lineTo(r * 0.42, -r * 0.72);
    ctx.lineTo(-r * 0.15, -r * 0.86);
    ctx.lineTo(-r * 0.62, -r * 0.58);
    ctx.lineTo(-r * 1.15, 0);
    ctx.lineTo(-r * 0.62, r * 0.58);
    ctx.lineTo(-r * 0.15, r * 0.86);
    ctx.lineTo(r * 0.42, r * 0.72);
    ctx.closePath();
    ctx.fill();

    // Body core
    ctx.fillStyle = frozenShatter ? "#bae6fd" : bodyCol;
    ctx.beginPath();
    ctx.arc(r * 0.18, 0, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  damageEnemy(e, amount, kx, ky, bulletType = "bullet", attackerId = "host") {
    if (!e || !e.active) return;

    e.hitFlash = 3;
    if (bulletType === "flame") e.burnTimer = 45;
    if (bulletType === "cryo") e.chillTimer = 60;

    sfx.playMonsterHit();
    this.bakeBloodSplatter(e.x, e.y, e.radius, 1);

    const bloodColor = bulletType === "cryo" ? "#38bdf8" : (bulletType === "flame" ? "#f97316" : "#dc2626");
    for (let s = 0; s < 4; s++) {
      this.spawnParticle(
        e.x,
        e.y,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        bloodColor,
        2.6,
        16
      );
    }

    // Rule D: Client shows immediate hit VFX/SFX (Client-side prediction) and sends ENEMY_HIT to Host without deleting enemy locally
    if (this.mode === "coop" && !this.isHost) {
      e.x += (kx || 0) * 0.35;
      e.y += (ky || 0) * 0.35;
      if (e.id) {
        socketService.sendEvent("ENEMY_HIT", {
          id: e.id,
          damage: Number(amount.toFixed(2)),
          kx: Number((kx || 0).toFixed(2)),
          ky: Number((ky || 0).toFixed(2)),
          bulletType,
          attackerId: "client"
        });
      }
      return;
    }

    e.hp -= amount;
    e.x += kx || 0;
    e.y += ky || 0;

    if (e.hp <= 0) {
      e.active = false;
      if (e.id) this.enemiesById.delete(e.id);
      this.kills++;
      if (attackerId === "host" || this.mode !== "coop") {
        this.player.credits += e.reward;
        this.addFloatingText(e.x, e.y - 15, `+$${e.reward}`, "#fbbf24");
      } else {
        this.addFloatingText(e.x, e.y - 15, `ĐỒNG ĐỘI +$${e.reward}`, "#38bdf8");
      }
      sfx.playMonsterDeath(false);
      this.bakeAlienCorpse(e, bulletType === "cryo");
      this._notifyPlayerState();

      // Bloodbath burst particles on death
      for (let s = 0; s < 14; s++) {
        this.spawnParticle(
          e.x,
          e.y,
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 9,
          "#dc2626",
          3.2,
          24
        );
      }

      // 22% chance to drop Item / Cash
      let droppedItemPayload = null;
      if (Math.random() < 0.22) {
        const drop = this.itemManager.spawnDrop(e.x, e.y);
        if (drop) {
          droppedItemPayload = { kind: drop.kind, x: Math.round(drop.x), y: Math.round(drop.y) };
        }
      }

      // Rule D: Host broadcasts ENEMY_DIE to Client
      if (this.mode === "coop" && this.isHost && e.id) {
        socketService.sendEvent("ENEMY_DIE", {
          id: e.id,
          x: Math.round(e.x),
          y: Math.round(e.y),
          killerId: attackerId || "host",
          reward: e.reward,
          isFrozen: bulletType === "cryo",
          dropItem: droppedItemPayload
        });
      }
    }
  }

  damageBoss(boss, amount, bulletType = "bullet") {
    if (!boss.active || boss.hp <= 0) return;

    if (bulletType === "flame") amount *= 0.60;
    if (bulletType === "cryo") amount *= 0.70;

    // Queue boss damage to host if playing as coop client
    if (!this.isHost && this.mode === "coop") {
      const bIdx = this.bosses.indexOf(boss);
      if (bIdx !== -1) {
        this.pendingBossHits.push({ i: bIdx, dmg: amount, t: bulletType });
      }
    }

    if (boss.shield > 0) {
      if (boss.shield >= amount) {
        boss.shield -= amount;
        amount = 0;
      } else {
        amount -= boss.shield;
        boss.shield = 0;
      }
      this.spawnParticle(boss.x, boss.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, "#38bdf8", 3, 10);
    }

    if (amount > 0) {
      boss.hp -= amount;
      boss.hitFlash = 3;
      sfx.playMonsterHit();
      this.bakeBloodSplatter(boss.x, boss.y, boss.radius * 0.8, 1.5);

      for (let s = 0; s < 4; s++) {
        this.spawnParticle(boss.x, boss.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, boss.glowColor, 3.5, 16);
      }

      if (boss.hp <= 0) {
        boss.active = false;
        boss.hp = 0;
        this.kills++;
        this.player.credits += boss.reward;
        sfx.playMonsterDeath(true);
        this.bakeAlienCorpse(boss, bulletType === "cryo");
        this.screenShake = 25;
        this.addFloatingText(boss.x, boss.y - 30, `TRÙM ĐÃ BỊ TIÊU DIỆT! +$${boss.reward}`, "#4ade80");

        // Guaranteed Item Drops from Boss
        this.itemManager.spawnDrop(boss.x - 30, boss.y, "cash");
        this.itemManager.spawnDrop(boss.x + 30, boss.y, "medkit");
        this.itemManager.spawnDrop(boss.x, boss.y - 30, "overdrive");

        const remaining = this.bosses.filter(b => b.active && b.hp > 0);
        if (remaining.length === 0) {
          this.triggerVictory();
        }
      }
    }

    this._notifyBossState();
  }

  update(dt, now) {
    this.frameCounter++;
    if (this.player.invulnTimer > 0) this.player.invulnTimer--;
    if (this.globalFreezeTimer > 0) this.globalFreezeTimer--;

    // Update Buff Timers
    if (this.player.speedBuffTimer > 0) {
      this.player.speedBuffTimer--;
      if (this.player.speedBuffTimer <= 0) this.player.speed = this.player.baseSpeed || 3.6;
    }
    if (this.player.overdriveBuffTimer > 0) {
      this.player.overdriveBuffTimer--;
    }

    // Autonomous UAV Laser Drones Support Fire
    if (this.player.droneCount > 0 && this.frameCounter % 24 === 0 && !this.player.isDown) {
      let nearest = null;
      let minDist = 400;
      for (let i = 0; i < this.MAX_ENEMIES; i++) {
        const e = this.enemies[i];
        if (!e.active || e.hp <= 0) continue;
        const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (d < minDist) { minDist = d; nearest = e; }
      }
      if (!nearest) {
        for (let b = 0; b < this.bosses.length; b++) {
          const boss = this.bosses[b];
          if (!boss.active || boss.hp <= 0) continue;
          const d = Math.hypot(boss.x - this.player.x, boss.y - this.player.y);
          if (d < minDist) { minDist = d; nearest = boss; }
        }
      }
      if (nearest) {
        for (let d = 0; d < this.player.droneCount; d++) {
          const oAng = (now * 0.0035) + (d * Math.PI * 2 / this.player.droneCount);
          const dx = this.player.x + Math.cos(oAng) * 44;
          const dy = this.player.y + Math.sin(oAng) * 44;
          const fireAngle = Math.atan2(nearest.y - dy, nearest.x - dx);
          this.spawnBullet(dx, dy, fireAngle, {
            speed: 22,
            damage: 14 * this.player.damageMultiplier,
            color: "#38bdf8",
            size: 3.5,
            type: "bullet",
            knockback: 1.5,
            life: 45
          }, false, false);
          this.spawnParticle(dx, dy, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, "#38bdf8", 2.0, 5);
        }
      }
    }

    // 1. Player Movement & Jetpack Dash
    let isMoving = false;
    if (this.player.dashCooldown > 0) this.player.dashCooldown--;

    // Process trail history decay
    if (this.player.trailHistory && this.player.trailHistory.length > 0) {
      for (let i = this.player.trailHistory.length - 1; i >= 0; i--) {
        this.player.trailHistory[i].life--;
        if (this.player.trailHistory[i].life <= 0) {
          this.player.trailHistory.splice(i, 1);
        }
      }
    }

    if (!this.player.isDown) {
      if ((this.player.dashActiveTimer || 0) > 0) {
        this.player.dashActiveTimer--;
        this.player.x += this.player.dashVx;
        this.player.y += this.player.dashVy;
        this.player.trailHistory.push({
          x: this.player.x,
          y: this.player.y,
          angle: this.player.angle,
          life: 14
        });
        isMoving = true;
      } else {
        let mx = 0, my = 0;
        if (this.keys["KeyW"] || this.keys["ArrowUp"]) my -= 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) my += 1;
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) mx -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) mx += 1;

        if (mx !== 0 || my !== 0) {
          isMoving = true;
          const len = Math.hypot(mx, my) || 1;
          this.player.x += (mx / len) * this.player.speed;
          this.player.y += (my / len) * this.player.speed;
          this.player.walkCycle = (this.player.walkCycle || 0) + 0.22;
        }
      }
    }
    this.player.isMoving = isMoving;

    // Pending Turret Deployment
    if (this.pendingTurretDeploy && this.pendingTurretDeploy.active) {
      const movedDist = Math.hypot(this.player.x - this.pendingTurretDeploy.anchorX, this.player.y - this.pendingTurretDeploy.anchorY);
      if (this.player.isDown || (this.player.dashActiveTimer || 0) > 0 || movedDist > 70) {
        this.pendingTurretDeploy.active = false;
        sfx.playError();
        this.addFloatingText(this.pendingTurretDeploy.x, this.pendingTurretDeploy.y - 25, "ĐÃ HỦY TRIỂN KHAI THÁP PHÁO!", "#f43f5e");
      } else {
        this.pendingTurretDeploy.elapsedMs += dt;
        if (this.pendingTurretDeploy.elapsedMs >= this.pendingTurretDeploy.durationMs) {
          this.pendingTurretDeploy.active = false;
          if (this.player.turretCount > 0) {
            this.player.turretCount--;
          } else if (this.player.credits >= 350) {
            this.player.credits -= 350;
          }
          this.turrets.push({
            id: "turret_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            active: true,
            x: this.pendingTurretDeploy.x,
            y: this.pendingTurretDeploy.y,
            angle: this.pendingTurretDeploy.angle,
            fireCooldown: 0,
            hp: 250,
            maxHp: 250
          });
          sfx.playSample("energy_on", 1.0, 0.02);
          this.screenShake = 6;
          this.addFloatingText(this.pendingTurretDeploy.x, this.pendingTurretDeploy.y - 25, "THÁP PHÁO ĐÃ KÍCH HOẠT!", "#4ade80");
          for (let p = 0; p < 12; p++) {
            const ang = (p / 12) * Math.PI * 2;
            this.spawnParticle(this.pendingTurretDeploy.x, this.pendingTurretDeploy.y, Math.cos(ang) * 3, Math.sin(ang) * 3, "#4ade80", 3, 15);
          }
          this._notifyPlayerState();
        }
      }
    }

    // Active Turrets Firing Logic
    for (let t = 0; t < this.turrets.length; t++) {
      const tr = this.turrets[t];
      if (!tr.active) continue;
      if (tr.fireCooldown > 0) tr.fireCooldown--;
      if (tr.fireCooldown <= 0) {
        let target = null;
        let bestD = 520;
        for (let i = 0; i < this.MAX_ENEMIES; i++) {
          const e = this.enemies[i];
          if (!e.active || e.hp <= 0) continue;
          const d = Math.hypot(e.x - tr.x, e.y - tr.y);
          if (d < bestD) {
            bestD = d;
            target = e;
          }
        }
        if (!target) {
          for (let b = 0; b < this.bosses.length; b++) {
            const boss = this.bosses[b];
            if (!boss.active || boss.hp <= 0) continue;
            const d = Math.hypot(boss.x - tr.x, boss.y - tr.y);
            if (d < bestD) {
              bestD = d;
              target = boss;
            }
          }
        }
        if (target) {
          tr.angle = Math.atan2(target.y - tr.y, target.x - tr.x);
          tr.fireCooldown = 12;
          const cos = Math.cos(tr.angle);
          const sin = Math.sin(tr.angle);
          const fwd = 22;
          const lat = 4.5;
          const b1x = tr.x + cos * fwd + sin * lat;
          const b1y = tr.y + sin * fwd - cos * lat;
          const b2x = tr.x + cos * fwd - sin * lat;
          const b2y = tr.y + sin * fwd + cos * lat;
          const bCfg = {
            speed: 24,
            damage: 10 * this.player.damageMultiplier,
            color: "#fde047",
            size: 2.8,
            type: "bullet",
            knockback: 1.5,
            life: 35
          };
          this.spawnBullet(b1x, b1y, tr.angle + (Math.random() - 0.5) * 0.04, bCfg, false);
          this.spawnBullet(b2x, b2y, tr.angle + (Math.random() - 0.5) * 0.04, bCfg, false);
          sfx.playSample("minigun", 0.45, 0.08);
        }
      }
    }

    // Teammate movement interpolation
    if (this.teammate.active) {
      const tdx = this.teammate.targetX - this.teammate.x;
      const tdy = this.teammate.targetY - this.teammate.y;
      const tdist = Math.hypot(tdx, tdy);
      if (tdist > 1.5) {
        this.teammate.x += tdx * 0.25;
        this.teammate.y += tdy * 0.25;
        this.teammate.walkCycle = (this.teammate.walkCycle || 0) + 0.22;
        this.teammate.isMoving = true;
      } else {
        this.teammate.isMoving = false;
      }
    }

    // Resolve Player & Teammate Wall Collisions
    this.world.resolveSliding(this.player);
    if (this.teammate.active) {
      this.world.resolveSliding(this.teammate);
    }

    // 2. Camera Follow & Screen Shake
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.camera.x += (this.player.x - cw / 2 - this.camera.x) * 0.14;
    this.camera.y += (this.player.y - ch / 2 - this.camera.y) * 0.14;

    const worldMouseX = this.mouse.x + this.camera.x;
    const worldMouseY = this.mouse.y + this.camera.y;
    this.player.angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 0.45);
    }

    // 3. Firing Handling
    if (this.mouse.down) {
      this.firePlayerWeapon(now);
    } else {
      if (this.player.laserHeat > 0) this.player.laserHeat = Math.max(0, this.player.laserHeat - 0.04);
      this.player.activeLaserBeam = null;
    }

    if (this.teammate.active) {
      this.fireTeammateWeapon(now);
    }

    // 4. Update World Mechanisms: Doors & Generator
    const activeEntities = [this.player];
    if (this.teammate.active) activeEntities.push(this.teammate);
    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      if (this.enemies[i].active) activeEntities.push(this.enemies[i]);
    }

    this.world.updateAutoDoors(activeEntities, sfx);
    this.world.updateGenerator(this.player, !!this.keys["KeyE"], dt, this);

    // 5. Update Collectible Items (Individual Wallets)
    this.itemManager.update(
      [this.player, this.teammate.active ? this.teammate : null],
      dt,
      (kind, p, x, y) => activateItemPowerup(kind, p, x, y, this),
      (itemId, kind, p) => {
        if (this.mode === "coop" && !this.isHost && p === this.player) {
          this.pendingPickedItems.push(itemId);
        }
      }
    );

    // 6. Wave Spawner Logic
    if (this.isHost || this.mode === "solo") {
      this.spawnTimer += dt;
      if (this.spawnTimer > 1200 && this.enemiesSpawnedInWave < this.waveMaxSpawns) {
        this.spawnTimer = 0;
        this.spawnEnemy();
        this.enemiesSpawnedInWave++;

        if (this.enemiesSpawnedInWave >= this.waveMaxSpawns && !this.bossSpawned) {
          this.spawnBossSquad();
        }
      }
    }

    // 7. Update Enemies & AI Navigation (Rules A, C, E: Host AI + Client Dead Reckoning & Lerp + Delta Time)
    const hasTeammate = this.teammate.active && !this.teammate.isDown;
    const isFrozen = this.globalFreezeTimer > 0;
    const dtScale = dt / this.FIXED_PHYSICS_STEP;

    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      const e = this.enemies[i];
      if (!e.active) continue;

      if (e.hitFlash > 0) e.hitFlash--;
      if (e.chillTimer > 0) e.chillTimer--;
      if (e.burnTimer > 0) {
        e.burnTimer--;
        if ((this.isHost || this.mode === "solo") && e.burnTimer % 15 === 0) {
          this.damageEnemy(e, 4, 0, 0, "flame");
        }
      }

      // Check walking on acid pools
      for (let ap = 0; ap < this.world.acidPools.length; ap++) {
        const pool = this.world.acidPools[ap];
        if (Math.hypot(e.x - pool.x, e.y - pool.y) <= pool.radius) {
          e.chillTimer = 60; // Slowed by acid
          if (this.isHost || this.mode === "solo") {
            this.damageEnemy(e, 1.2, 0, 0, "acid");
          }
        }
      }

      if (this.isHost || this.mode === "solo") {
        if (!isFrozen) {
          e.targetPlayerId = this._pickTargetPlayerId(e.x, e.y);
          const targetPlayer = this._resolveTargetPlayerPos(e.targetPlayerId);

          const edx = targetPlayer.x - e.x;
          const edy = targetPlayer.y - e.y;
          const edist = Math.hypot(edx, edy) || 1;
          e.angle = Math.atan2(edy, edx);

          const spd = e.speed * (e.chillTimer > 0 ? 0.45 : 1.0);
          e.vx = (edx / edist) * spd;
          e.vy = (edy / edist) * spd;
          e.x += e.vx * dtScale;
          e.y += e.vy * dtScale;
          e.legPhase += 0.28 * dtScale;

          this.world.resolveSliding(e);

          // Ranged Attack
          if (e.ranged && edist < 500 && edist > 100) {
            e.shootCooldown--;
            if (e.shootCooldown <= 0) {
              e.shootCooldown = e.isElite ? 85 : 120;
              if (e.burstTriShot) {
                for (let k = -1; k <= 1; k++) {
                  this.spawnBullet(e.x, e.y, e.angle + k * 0.18, { speed: 8.5, damage: 12, color: "#a855f7", size: 5.5, type: "plasma" }, true);
                }
              } else {
                this.spawnBullet(e.x, e.y, e.angle, { speed: 7.0, damage: 10, color: "#4ade80", size: 5.0, type: "acid" }, true);
              }
            }
          }

          // Melee attack on Host
          const pDist = Math.hypot(this.player.x - e.x, this.player.y - e.y) || 1;
          if (!this.player.isDown && pDist < e.radius + this.player.radius) {
            this.damagePlayer(e.damage);
            e.x -= ((this.player.x - e.x) / pDist) * 15;
            e.y -= ((this.player.y - e.y) / pDist) * 15;
          }
        } else {
          e.vx = 0;
          e.vy = 0;
        }
      } else {
        // Rule C (Client): Dead Reckoning toward targetPlayerId + Linear Interpolation (Lerp)
        const targetPlayer = this._resolveTargetPlayerPos(e.targetPlayerId || "host");
        const tdx = targetPlayer.x - e.x;
        const tdy = targetPlayer.y - e.y;
        const tDist = Math.hypot(tdx, tdy) || 1;
        const spd = e.speed * (e.chillTimer > 0 ? 0.45 : 1.0);

        let predVx = typeof e.vx === "number" ? e.vx : (tdx / tDist) * spd;
        let predVy = typeof e.vy === "number" ? e.vy : (tdy / tDist) * spd;
        if (isFrozen) {
          predVx = 0;
          predVy = 0;
        }

        e.x += predVx * dtScale;
        e.y += predVy * dtScale;

        if (typeof e.serverX === "number" && typeof e.serverY === "number") {
          e.serverX += predVx * dtScale;
          e.serverY += predVy * dtScale;
          const errDist = Math.hypot(e.serverX - e.x, e.serverY - e.y);
          if (errDist > 420) {
            e.x = e.serverX;
            e.y = e.serverY;
          } else if (errDist > 0.5) {
            const lerpAlpha = 1 - Math.pow(1 - 0.22, dtScale);
            e.x += (e.serverX - e.x) * lerpAlpha;
            e.y += (e.serverY - e.y) * lerpAlpha;
          }
        }

        this.world.resolveSliding(e);
        e.angle = Math.atan2(tdy, tdx);
        e.legPhase += 0.28 * dtScale;

        // Client side melee collision check
        const cdx = this.player.x - e.x;
        const cdy = this.player.y - e.y;
        const cdist = Math.hypot(cdx, cdy) || 1;
        if (!this.player.isDown && cdist < e.radius + this.player.radius) {
          this.damagePlayer(e.damage);
        }
      }
    }

    // 8. Update Boss AI
    if (this.isHost || this.mode === "solo") {
      this.bosses.forEach(boss => {
        if (boss.active && boss.hp > 0) {
          if (boss.hitFlash > 0) boss.hitFlash--;
          const bossTargetId = this._pickTargetPlayerId(boss.x, boss.y);
          const bossTargetPlayer = this._resolveTargetPlayerPos(bossTargetId);
          updateBossAI(
            boss,
            bossTargetPlayer,
            dt,
            (x, y, a, w, h) => this.spawnBullet(x, y, a, w, h),
            sfx,
            (x, y, t, c) => this.addFloatingText(x, y, t, c)
          );
          this.world.resolveSliding(boss);
        }
      });
    }

    // 9. Update Bullets & Collisions with Walls, Barrels, Crates, Enemies, Bosses
    for (let i = 0; i < this.MAX_BULLETS; i++) {
      const b = this.bullets[i];
      if (!b.active) continue;

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.type === "flame") {
        b.vx *= 0.96;
        b.vy *= 0.96;
        b.size += 0.28;
      }

      // Check Walls & Closed Doors
      if (this.world.pointHitsWall(b.x, b.y)) {
        for (let s = 0; s < 3; s++) {
          this.spawnParticle(b.x, b.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, b.color, 2, 8);
        }
        b.active = false;
        continue;
      }

      // Check Barrels
      let hitProp = false;
      for (let brIdx = 0; brIdx < this.world.barrels.length; brIdx++) {
        const br = this.world.barrels[brIdx];
        if (br.active && Math.hypot(b.x - br.x, b.y - br.y) < br.radius + b.size) {
          br.hp -= b.damage;
          if (br.hp <= 0) {
            if (!this.isHost && this.mode === "coop" && br.id !== undefined) {
              this.pendingBarrelExplodes.push(br.id);
            }
            this.world.explodeBarrel(br, this);
          }
          b.active = false;
          hitProp = true;
          break;
        }
      }
      if (hitProp) continue;

      // Check Crates
      for (let crIdx = 0; crIdx < this.world.crates.length; crIdx++) {
        const cr = this.world.crates[crIdx];
        if (cr.active && b.x >= cr.x && b.x <= cr.x + cr.w && b.y >= cr.y && b.y <= cr.y + cr.h) {
          if (!this.isHost && this.mode === "coop" && cr.id !== undefined) {
            this.pendingCrateHits.push({ i: cr.id, dmg: b.damage });
          }
          this.world.damageCrate(cr, b.damage, this);
          b.active = false;
          hitProp = true;
          break;
        }
      }
      if (hitProp) continue;

      // Hostile bullets hitting Player
      if (b.isHostile) {
        const pd = Math.hypot(b.x - this.player.x, b.y - this.player.y);
        if (pd < this.player.radius + b.size) {
          this.damagePlayer(b.damage);
          b.active = false;
          continue;
        }
      } else {
        // Player/Teammate hitting Enemies
        let hit = false;
        for (let j = 0; j < this.MAX_ENEMIES; j++) {
          const e = this.enemies[j];
          if (!e.active) continue;

          if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.size) {
            if (b.isTeammate) {
              e.hitFlash = 3;
              this.spawnParticle(e.x, e.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, "#dc2626", 2.5, 10);
            } else {
              this.damageEnemy(e, b.damage, (b.vx / 10) * b.knockback, (b.vy / 10) * b.knockback, b.type);
            }
            b.pierce--;
            if (b.pierce <= 0) {
              b.active = false;
              hit = true;
              break;
            }
          }
        }
        if (hit) continue;

        // Player/Teammate hitting Bosses
        for (let j = 0; j < this.bosses.length; j++) {
          const boss = this.bosses[j];
          if (!boss.active || boss.hp <= 0) continue;

          if (Math.hypot(b.x - boss.x, b.y - boss.y) < boss.radius + b.size) {
            this.damageBoss(boss, b.damage, b.type);
            b.pierce--;
            if (b.pierce <= 0) {
              b.active = false;
              break;
            }
          }
        }
      }
    }

    // 10. Update Particles & Casings & Texts
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) p.active = false;
    }

    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i];
      s.life--;
      if (s.life < 40) s.alpha = s.life / 40;
      if (s.life <= 0) this.shells.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.6;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 11. Teammate LERP & 5s Revive hold
    if (this.teammate.active) {
      this.teammate.x += (this.teammate.targetX - this.teammate.x) * 0.35;
      this.teammate.y += (this.teammate.targetY - this.teammate.y) * 0.35;

      if (this.teammate.isDown && !this.player.isDown) {
        const dist = Math.hypot(this.player.x - this.teammate.x, this.player.y - this.teammate.y);
        if (dist <= 75) {
          this.teammate.reviveProgress = (this.teammate.reviveProgress || 0) + (dt / 5000);
          if (this.teammate.reviveProgress >= 1.0) {
            this.teammate.isDown = false;
            this.teammate.reviveProgress = 0;
            this.teammate.hp = 40;
            this.teammate.armor = 25;
            socketService.sendReviveSuccess({ hp: 40, armor: 25 });
            sfx.playPickup("armor");
            this.addFloatingText(this.teammate.x, this.teammate.y - 30, "ĐÃ CỨU HỒI SINH ĐỒNG ĐỘI!", "#10b981");
          }
        } else {
          this.teammate.reviveProgress = Math.max(0, this.teammate.reviveProgress - (dt / 2500));
        }
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const now = performance.now();

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();

    // Camera Translation + Screen Shake
    const shakeX = (Math.random() - 0.5) * this.screenShake;
    const shakeY = (Math.random() - 0.5) * this.screenShake;
    ctx.translate(-Math.round(this.camera.x + shakeX), -Math.round(this.camera.y + shakeY));

    // 1. Render World Environment (Floors, Walls, Doors, Generator, Props)
    this.world.render(ctx, now);

    // 1.5. Render Persistent Decals (Blood splatters, Scorch marks & Alien Corpses)
    ctx.drawImage(this.surfaceCanvas, 0, 0);

    // 1.6. Render Sci-Fi Ground Fire Patches (Flickering Flame Cores & Jumping Tongues)
    for (let i = this.firePatches.length - 1; i >= 0; i--) {
      const fp = this.firePatches[i];
      fp.life--;
      if (fp.life <= 0) {
        this.firePatches.splice(i, 1);
        continue;
      }
      const alpha = Math.min(0.92, fp.life / 60);
      const flick = 0.88 + 0.18 * Math.sin(now * 0.024 + fp.phase);
      ctx.save();
      ctx.translate(fp.x, fp.y);

      if (fp.isOilFire) {
        ctx.fillStyle = `rgba(10, 14, 22, ${0.72 * alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, fp.radius * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      const fg = ctx.createRadialGradient(0, 0, 4, 0, 0, fp.radius * flick);
      fg.addColorStop(0, `rgba(255, 255, 255, ${0.85 * alpha})`);
      fg.addColorStop(0.32, `rgba(253, 224, 71, ${0.78 * alpha})`);
      fg.addColorStop(0.68, `rgba(249, 115, 22, ${0.58 * alpha})`);
      fg.addColorStop(1, "rgba(220, 38, 38, 0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(0, 0, fp.radius * flick, 0, Math.PI * 2);
      ctx.fill();

      // Jumping Flame Tongues
      for (let t = 0; t < 3; t++) {
        const tang = fp.phase + t * 2.09 + now * 0.006;
        const tr = fp.radius * 0.42;
        const tx = Math.cos(tang) * tr;
        const ty = Math.sin(tang) * tr;
        ctx.fillStyle = (t % 2 === 0) ? `rgba(253, 224, 71, ${0.75 * alpha})` : `rgba(239, 68, 68, ${0.65 * alpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, (7 + t * 2.5) * flick, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 1.7. Render Expanding Shockwave Blast Rings
    for (let i = this.shockwaveRings.length - 1; i >= 0; i--) {
      const sr = this.shockwaveRings[i];
      sr.r += (sr.maxR - sr.r) * 0.18 + 2.5;
      sr.alpha -= 0.04;
      if (sr.alpha <= 0 || sr.r >= sr.maxR) {
        this.shockwaveRings.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = sr.color;
      ctx.globalAlpha = Math.max(0, sr.alpha);
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(sr.x, sr.y, sr.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Render Shell Casings
    for (let i = 0; i < this.shells.length; i++) {
      const s = this.shells[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.globalAlpha = s.alpha * 0.8;
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-3, -1, 6, 2.5);
      ctx.restore();
    }
    ctx.globalAlpha = 1.0;

    // 3. Render Collectible Items
    this.itemManager.render(ctx, now);

    // 4. Render Boss Ground Telegraph Runes
    this.bosses.forEach(boss => {
      if (boss.active && (boss.skillState === "telegraph" || boss.skillState === "firing")) {
        drawBossGroundTelegraph(ctx, boss, now);
      }
    });

    // 5. Render Xenomorph Enemies
    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      const e = this.enemies[i];
      if (e.active) {
        drawXenomorphMonster(ctx, e, now);
      }
    }

    // 6. Render Colossal Multi-Bosses
    this.bosses.forEach(boss => {
      if (boss.active && boss.hp > 0) {
        drawBossEntity(ctx, boss, now);
      }
    });

    // 7. Render Laser Beams
    this.renderLaserBeam(ctx, this.player.activeLaserBeam);
    if (this.teammate.active) {
      this.renderLaserBeam(ctx, this.teammate.activeLaserBeam);
    }

    // 8. Render Bullets
    ctx.lineCap = "round";
    for (let i = 0; i < this.MAX_BULLETS; i++) {
      const b = this.bullets[i];
      if (!b.active) continue;

      if (b.type === "flame") {
        const a = Math.max(0.15, b.life / b.maxLife);
        ctx.fillStyle = b.life > b.maxLife * 0.55
          ? `rgba(253, 224, 71, ${a})`
          : `rgba(249, 115, 22, ${a * 0.88})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === "plasma") {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.size * 1.3;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 1.6, b.y - b.vy * 1.6);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1.2, b.size * 0.5);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 0.7, b.y - b.vy * 0.7);
        ctx.stroke();
      }
    }

    // 9. Render Particles
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Render Deployed Auto-Turrets
    for (let t = 0; t < this.turrets.length; t++) {
      const tr = this.turrets[t];
      if (!tr.active) continue;
      ctx.save();
      ctx.translate(tr.x, tr.y);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      if (this.turretAsset && this.turretAsset.complete && this.turretAsset.naturalWidth > 0) {
        ctx.rotate(tr.angle);
        const targetBaseDiameter = 38;
        const scale = targetBaseDiameter / 750;
        const dw = this.turretAsset.naturalWidth * scale;
        const dh = this.turretAsset.naturalHeight * scale;
        const dx = -457 * scale;
        const dy = -458 * scale;
        ctx.drawImage(this.turretAsset, dx, dy, dw, dh);

        // Tech core pulse
        const pulse = (Math.sin(now * 0.008) + 1) * 0.5;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.45 + pulse * 0.45})`;
        ctx.beginPath();
        ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Fallback procedural turret
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          const a = k * (Math.PI * 2 / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15);
          ctx.stroke();
        }

        ctx.rotate(tr.angle);
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(-11, -9, 22, 18, 4);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(-11, -9, 22, 18);
          ctx.strokeRect(-11, -9, 22, 18);
        }

        // Twin Barrels
        ctx.fillStyle = "#fde047";
        ctx.fillRect(10, -5, 12, 3);
        ctx.fillRect(10, 2, 12, 3);
      }
      ctx.restore();
    }

    // Pending Turret Hologram Deploy Ring
    if (this.pendingTurretDeploy && this.pendingTurretDeploy.active) {
      const p = this.pendingTurretDeploy;
      ctx.save();
      ctx.translate(p.x, p.y);
      const pct = Math.min(1, p.elapsedMs / p.durationMs);

      // Outer progress circle
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 26, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
      ctx.stroke();

      // Holographic dash ring
      ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();

      // Holographic Turret Base Preview
      if (this.turretAsset && this.turretAsset.complete && this.turretAsset.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.55 * pct;
        ctx.rotate(p.angle);
        const scale = 38 / 750;
        const dw = this.turretAsset.naturalWidth * scale;
        const dh = this.turretAsset.naturalHeight * scale;
        ctx.drawImage(this.turretAsset, -457 * scale, -458 * scale, dw, dh);
        ctx.restore();
      }

      ctx.font = "800 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#4ade80";
      ctx.textAlign = "center";
      ctx.fillText(`TRIỂN KHAI ${Math.floor(pct * 100)}%`, 0, -32);
      ctx.restore();
    }

    // Dash / Speed Afterimage Trail
    if (this.player.trailHistory && this.player.trailHistory.length > 0) {
      for (let i = 0; i < this.player.trailHistory.length; i++) {
        const tr = this.player.trailHistory[i];
        ctx.save();
        ctx.translate(tr.x, tr.y);
        ctx.rotate(tr.angle);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0, tr.life / 22)})`;
        ctx.beginPath();
        ctx.ellipse(-2, 0, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 10. Render Teammate (Player 2)
    if (this.teammate.active) {
      this.renderCharacter(ctx, this.teammate, true, now);
    }

    // 11. Render Local Player (Player 1)
    this.renderCharacter(ctx, this.player, false, now);

    // Render Orbiting Autonomous Combat UAV Drones
    if (this.player.droneCount > 0 && !this.player.isDown) {
      for (let d = 0; d < this.player.droneCount; d++) {
        const oAng = (now * 0.0035) + (d * Math.PI * 2 / this.player.droneCount);
        const dx = this.player.x + Math.cos(oAng) * 44;
        const dy = this.player.y + Math.sin(oAng) * 44;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(oAng + Math.PI * 0.5);

        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.arc(0, 4, 9, 0, Math.PI * 2);
        ctx.fill();

        if (this.droneImg && this.droneImg.complete && this.droneImg.naturalWidth > 0) {
          const dSize = 28;
          ctx.drawImage(this.droneImg, -dSize / 2, -dSize / 2, dSize, dSize);
        } else {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(-6, -6, 12, 12);
        }

        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 1.2;
        const rOff = 8;
        for (const rx of [-rOff, rOff]) {
          for (const ry of [-rOff, rOff]) {
            ctx.beginPath();
            ctx.arc(rx, ry, 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }

    // 12. Floating Combat Texts
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ctx.save();
      ctx.font = "800 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.life / 54);
      ctx.textAlign = "center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 13. Near Generator Prompt Banner
    const distToGen = Math.hypot(this.player.x - this.world.generator.x, this.player.y - this.world.generator.y);
    if (distToGen <= 95 && !this.world.generator.active && !this.player.isDown) {
      ctx.save();
      ctx.font = "800 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#f59e0b";
      ctx.textAlign = "center";
      ctx.fillText("GIỮ [E] (5 GIÂY) ĐỂ KHỞI ĐỘNG MÁY PHÁT ĐIỆN", this.world.generator.x, this.world.generator.y - 58);
      ctx.restore();
    }

    ctx.restore();

    // 14. Atmospheric Dynamic Lighting & Flashlight Mask
    this.renderLighting(cw, ch, Math.round(this.camera.x + shakeX), Math.round(this.camera.y + shakeY));

    // 15. Teammate Off-Screen Radar Arrow & Downed Distress Signal
    if (this.mode === "coop" && this.teammate && this.teammate.active) {
      this.renderTeammatePointer(this.ctx, cw, ch, Math.round(this.camera.x + shakeX), Math.round(this.camera.y + shakeY), now);
    }

    // 16. Subtle Sci-Fi Screen Vignette Overlay
    ctx.save();
    const gVig = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.38, cw / 2, ch / 2, Math.hypot(cw, ch) * 0.54);
    gVig.addColorStop(0, "rgba(0, 0, 0, 0)");
    gVig.addColorStop(1, "rgba(3, 7, 18, 0.45)");
    ctx.fillStyle = gVig;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }

  renderLighting(cw, ch, camX, camY) {
    const targetW = Math.max(1, Math.floor(cw * this.LIGHT_SCALE));
    const targetH = Math.max(1, Math.floor(ch * this.LIGHT_SCALE));
    if (this.lightCanvas.width !== targetW || this.lightCanvas.height !== targetH) {
      this.lightCanvas.width = targetW;
      this.lightCanvas.height = targetH;
    }

    const lightCtx = this.lightCtx;
    lightCtx.save();
    lightCtx.setTransform(this.LIGHT_SCALE, 0, 0, this.LIGHT_SCALE, 0, 0);

    // 1. Darkness Overlay Mask
    lightCtx.globalCompositeOperation = "source-over";
    if (this.player.hasNvg) {
      lightCtx.fillStyle = "rgba(6, 28, 12, 0.45)"; // Soft NVG green tint
    } else {
      lightCtx.fillStyle = "rgba(4, 8, 18, 0.84)"; // Tactical sci-fi deep darkness
    }
    lightCtx.fillRect(0, 0, cw, ch);

    // 2. Punch Light Holes via destination-out
    lightCtx.globalCompositeOperation = "destination-out";

    // Player 1 Flashlight Cone & Ambient Aura
    if (!this.player.isDown) {
      const px = this.player.x - camX;
      const py = this.player.y - camY;

      // Flashlight Cone (580px reach)
      lightCtx.save();
      lightCtx.translate(px, py);
      lightCtx.rotate(this.player.angle);
      const coneLen = 580;
      const gCone = lightCtx.createRadialGradient(0, 0, 14, 0, 0, coneLen);
      gCone.addColorStop(0, "rgba(0,0,0,1)");
      gCone.addColorStop(0.72, "rgba(0,0,0,0.7)");
      gCone.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gCone;
      lightCtx.beginPath();
      lightCtx.moveTo(0, 0);
      lightCtx.arc(0, 0, coneLen, -0.44, 0.44);
      lightCtx.closePath();
      lightCtx.fill();
      lightCtx.restore();

      // Ambient Body Aura
      const auraR = this.player.muzzleFlash > 0 ? 240 : 160;
      const gAura = lightCtx.createRadialGradient(px, py, 14, px, py, auraR);
      gAura.addColorStop(0, "rgba(0,0,0,1)");
      gAura.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gAura;
      lightCtx.beginPath();
      lightCtx.arc(px, py, auraR, 0, Math.PI * 2);
      lightCtx.fill();
    }

    // Player 2 (Teammate in Co-op) Flashlight & Aura
    if (this.teammate.active && !this.teammate.isDown) {
      const tx = this.teammate.x - camX;
      const ty = this.teammate.y - camY;

      // Teammate Flashlight Cone
      lightCtx.save();
      lightCtx.translate(tx, ty);
      lightCtx.rotate(this.teammate.angle);
      const coneLen = 580;
      const gConeT = lightCtx.createRadialGradient(0, 0, 14, 0, 0, coneLen);
      gConeT.addColorStop(0, "rgba(0,0,0,1)");
      gConeT.addColorStop(0.72, "rgba(0,0,0,0.7)");
      gConeT.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gConeT;
      lightCtx.beginPath();
      lightCtx.moveTo(0, 0);
      lightCtx.arc(0, 0, coneLen, -0.44, 0.44);
      lightCtx.closePath();
      lightCtx.fill();
      lightCtx.restore();

      // Teammate Ambient Aura
      const gAuraT = lightCtx.createRadialGradient(tx, ty, 14, tx, ty, 150);
      gAuraT.addColorStop(0, "rgba(0,0,0,1)");
      gAuraT.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gAuraT;
      lightCtx.beginPath();
      lightCtx.arc(tx, ty, 150, 0, Math.PI * 2);
      lightCtx.fill();
    }

    // Power Generator Beacon
    const gx = this.world.generator.x - camX;
    const gy = this.world.generator.y - camY;
    if (gx > -250 && gx < cw + 250 && gy > -250 && gy < ch + 250) {
      const now = performance.now();
      const isOnline = this.world.generator.active;
      const genR = isOnline ? 240 : (100 + Math.sin(now * 0.008) * 25);
      const gGen = lightCtx.createRadialGradient(gx, gy, 12, gx, gy, genR);
      gGen.addColorStop(0, isOnline ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.85)");
      gGen.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gGen;
      lightCtx.beginPath();
      lightCtx.arc(gx, gy, genR, 0, Math.PI * 2);
      lightCtx.fill();
    }

    // Nuclear Bio-Vats (Radioactive Green Ambient Light)
    for (let i = 0; i < this.world.nuclearVats.length; i++) {
      const v = this.world.nuclearVats[i];
      if (!v.active) continue;
      const vx = v.x - camX;
      const vy = v.y - camY;
      if (vx < -100 || vx > cw + 100 || vy < -100 || vy > ch + 100) continue;
      const gVat = lightCtx.createRadialGradient(vx, vy, 8, vx, vy, 95);
      gVat.addColorStop(0, "rgba(0,0,0,0.88)");
      gVat.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gVat;
      lightCtx.beginPath();
      lightCtx.arc(vx, vy, 95, 0, Math.PI * 2);
      lightCtx.fill();
    }

    // Spacecraft Sci-Fi Props (Cryo Pods, Computers)
    for (let i = 0; i < this.world.spaceProps.length; i++) {
      const sp = this.world.spaceProps[i];
      const spx = sp.x + sp.w * 0.5 - camX;
      const spy = sp.y + sp.h * 0.5 - camY;
      if (spx < -120 || spx > cw + 120 || spy < -120 || spy > ch + 120) continue;
      const gProp = lightCtx.createRadialGradient(spx, spy, 6, spx, spy, 110);
      gProp.addColorStop(0, "rgba(0,0,0,0.75)");
      gProp.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gProp;
      lightCtx.beginPath();
      lightCtx.arc(spx, spy, 110, 0, Math.PI * 2);
      lightCtx.fill();
    }

    // Active Laser Beams Glow
    const drawLaserLight = (lb) => {
      if (!lb) return;
      lightCtx.save();
      lightCtx.strokeStyle = "rgba(0,0,0,0.92)";
      lightCtx.lineWidth = 64;
      lightCtx.lineCap = "round";
      lightCtx.beginPath();
      lightCtx.moveTo(lb.x1 - camX, lb.y1 - camY);
      lightCtx.lineTo(lb.x2 - camX, lb.y2 - camY);
      lightCtx.stroke();
      lightCtx.restore();
    };
    drawLaserLight(this.player.activeLaserBeam);
    if (this.teammate.active) drawLaserLight(this.teammate.activeLaserBeam);

    // Active Bosses Glow
    for (let b = 0; b < this.bosses.length; b++) {
      const boss = this.bosses[b];
      if (!boss.active || boss.hp <= 0) continue;
      const bx = boss.x - camX;
      const by = boss.y - camY;
      if (bx < -200 || bx > cw + 200 || by < -200 || by > ch + 200) continue;
      const gBoss = lightCtx.createRadialGradient(bx, by, 15, bx, by, 180);
      gBoss.addColorStop(0, "rgba(0,0,0,0.92)");
      gBoss.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = gBoss;
      lightCtx.beginPath();
      lightCtx.arc(bx, by, 180, 0, Math.PI * 2);
      lightCtx.fill();
    }

    // High energy Bullets / Rockets glow
    for (let i = 0; i < this.MAX_BULLETS; i += 2) {
      const b = this.bullets[i];
      if (!b.active) continue;
      if (b.type === "plasma" || b.type === "flame" || b.type === "acid") {
        const bx = b.x - camX;
        const by = b.y - camY;
        if (bx < -60 || bx > cw + 60 || by < -60 || by > ch + 60) continue;
        const gB = lightCtx.createRadialGradient(bx, by, 4, bx, by, 55);
        gB.addColorStop(0, "rgba(0,0,0,0.72)");
        gB.addColorStop(1, "rgba(0,0,0,0)");
        lightCtx.fillStyle = gB;
        lightCtx.beginPath();
        lightCtx.arc(bx, by, 55, 0, Math.PI * 2);
        lightCtx.fill();
      }
    }

    lightCtx.restore();

    // Composite darkness & lighting canvas onto main canvas
    this.ctx.drawImage(this.lightCanvas, 0, 0, this.lightCanvas.width, this.lightCanvas.height, 0, 0, cw, ch);
  }

  renderCharacter(ctx, entity, isTeammate = false, now = performance.now()) {
    if (!entity) return;

    ctx.save();
    ctx.translate(entity.x, entity.y);

    // 1. Downed state rendering
    if (entity.isDown) {
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (entity.reviveProgress > 0) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + entity.reviveProgress * Math.PI * 2);
        ctx.stroke();
      }

      ctx.font = "800 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#f43f5e";
      ctx.textAlign = "center";
      ctx.fillText(isTeammate ? "ĐỒNG ĐỘI GỤC" : "ĐANG GỤC NGÃ", 0, -42);

      ctx.restore();
      return;
    }

    // 2. Tactical Callsign Overhead Badge
    ctx.save();
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = isTeammate ? "#34d399" : "#38bdf8";
    ctx.fillText(isTeammate ? "[P2] BỒ ĐỘI" : "[P1] CHIẾN BINH", 0, -28);
    ctx.restore();

    ctx.rotate(entity.angle);

    const wId = entity.currentWeapon || 0;
    const isMoving = !!entity.isMoving;
    const isOverdrive = (entity.overdriveBuffTimer || 0) > 0;
    const isSpeed = (entity.speedBuffTimer || 0) > 0 || isMoving;

    // 3. Tactical Combat Boots with Walk Cycle Stride
    const stride = Math.sin(entity.walkCycle || 0) * 7.0;
    for (let side = -1; side <= 1; side += 2) {
      const footX = (side === -1 ? stride : -stride) - 1.5;
      const footY = side * 10.2;
      ctx.save();
      ctx.translate(footX, footY);
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = isTeammate ? "#059669" : "#475569";
      ctx.lineWidth = 1.3;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-6.5, -3.8, 13, 7.6, 2.5);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-6.5, -3.8, 13, 7.6);
        ctx.strokeRect(-6.5, -3.8, 13, 7.6);
      }
      ctx.fillStyle = isTeammate ? "#10b981" : "#334155";
      ctx.fillRect(1.5, -2.8, 4, 5.6);
      ctx.restore();
    }

    // 4. Jetpack Micro-Thruster Plumes when moving, dashing, or speed buffed
    const isDashing = (entity.dashActiveTimer || 0) > 0 || !!entity.isDashing;
    if (isSpeed || isDashing) {
      const jetLen = (isDashing ? 34 : (entity.speedBuffTimer > 0 ? 20 : 10)) + Math.abs(Math.sin(now * 0.04)) * 8;
      for (let side = -1; side <= 1; side += 2) {
        const ny = side * 7.0;
        const jetGrad = ctx.createLinearGradient(-14, ny, -14 - jetLen, ny);
        jetGrad.addColorStop(0, "#ffffff");
        jetGrad.addColorStop(0.35, isOverdrive ? "#f97316" : (isTeammate ? "#10b981" : "#38bdf8"));
        jetGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = jetGrad;
        ctx.beginPath();
        ctx.moveTo(-14, ny - 3);
        ctx.lineTo(-14 - jetLen, ny);
        ctx.lineTo(-14, ny + 3);
        ctx.closePath();
        ctx.fill();
      }
    }

    const skinAsset = this.playerSkins ? this.playerSkins.find(s => s.weaponId === wId) : null;
    const hasSkin = skinAsset && skinAsset.loaded && skinAsset.img;

    if (hasSkin) {
      // 5A. Tactical Laser Sight Line from Gun Barrel
      const sightStartX = skinAsset.gunLen || 38;
      ctx.save();
      ctx.strokeStyle = isTeammate ? "rgba(52, 211, 153, 0.35)" : (wId === 6 ? "rgba(0, 245, 212, 0.35)" : "rgba(56, 189, 248, 0.28)");
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(sightStartX, 0);
      ctx.lineTo(170, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Ground Drop Shadow under Mecha Armor
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;

      // Draw HD Weapon Character Sprite (sung_luc.png, short_gun.png, etc.)
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      const scale = skinAsset.scale || 0.026;
      ctx.scale(scale, scale);
      ctx.drawImage(skinAsset.img, -skinAsset.pivotX, -skinAsset.pivotY);
      ctx.restore();

      ctx.restore(); // restore shadow
    } else {
      // 5B. High-Tech Procedural Mecha Exo-Suit Fallback
      const armorPrimary = isOverdrive ? "#9a3412" : (isTeammate ? "#064e3b" : "#1e293b");
      const armorPlate   = isOverdrive ? "#ea580c" : (isTeammate ? "#047857" : "#0284c7");
      const armorBright  = isOverdrive ? "#fdba74" : (isTeammate ? "#34d399" : "#38bdf8");
      const visorCol     = isOverdrive ? "#fde047" : (isTeammate ? "#6ee7b7" : "#00f5d4");

      // Tactical Backpack Rig
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = isTeammate ? "#059669" : "#64748b";
      ctx.lineWidth = 1.5;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-17.5, -10.5, 9, 21, 3);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-17.5, -10.5, 9, 21);
        ctx.strokeRect(-17.5, -10.5, 9, 21);
      }

      // Ballistic Torso Carrier Vest
      ctx.fillStyle = armorPrimary;
      ctx.strokeStyle = armorBright;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(7.5, -10);
      ctx.lineTo(11, 0);
      ctx.lineTo(7.5, 10);
      ctx.lineTo(-10, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chest Rig Accent
      ctx.fillStyle = armorPlate;
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(5, -6.5);
      ctx.lineTo(7, 0);
      ctx.lineTo(5, 6.5);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();

      // Tactical Shoulder Pauldrons
      for (let side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.translate(-0.5, side * 13.2);
        ctx.rotate(side * 0.14);
        ctx.fillStyle = armorPrimary;
        ctx.strokeStyle = armorBright;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8.5, -side * 3.2);
        ctx.lineTo(7.5, -side * 2.2);
        ctx.lineTo(9.5, side * 3.8);
        ctx.lineTo(-6.5, side * 4.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Arms & Weapon Barrel
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 4.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(2, -11); ctx.lineTo(18, -2.5);
      ctx.moveTo(2, 11);  ctx.lineTo(10, 2.5);
      ctx.stroke();

      const gunLen = wId === 5 ? 38 : (wId === 2 ? 34 : (wId === 6 ? 36 : 28));
      const gunCol = wId === 6 ? "#00f5d4" : (wId === 5 ? "#a855f7" : (wId === 3 ? "#f97316" : "#475569"));
      ctx.fillStyle = gunCol;
      ctx.fillRect(8, -3.5, gunLen, 7);
      ctx.strokeStyle = armorBright;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(8, -3.5, gunLen, 7);

      // Ops-Core Combat Helmet & Glowing Visor
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = armorBright;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(3, -8);
      ctx.lineTo(8, -4);
      ctx.lineTo(9, 0);
      ctx.lineTo(8, 4);
      ctx.lineTo(3, 8);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = visorCol;
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.lineTo(8, -2.5);
      ctx.lineTo(8, 2.5);
      ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fill();
    }

    // 6. Overdrive Buff Aura
    if (isOverdrive) {
      ctx.save();
      ctx.strokeStyle = "rgba(249, 115, 22, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(8, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Nano Shield Invulnerability Aura
    if ((entity.invulnTimer || 0) > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 2.0;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Dynamic Muzzle Flash when shooting
    if (entity.muzzleFlash > 0) {
      entity.muzzleFlash--;
      const mLen = skinAsset ? (skinAsset.flashDist || skinAsset.gunLen || 38) : 32;
      ctx.save();
      ctx.translate(mLen, 0);
      ctx.fillStyle = wId === 6 ? "#00f5d4" : (wId === 5 ? "#c084fc" : (wId === 3 ? "#f97316" : "#fef08a"));
      ctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const rad = p % 2 === 0 ? 12 : 4.5;
        const ang = (p / 8) * Math.PI * 2;
        const fx = Math.cos(ang) * rad;
        const fy = Math.sin(ang) * rad;
        if (p === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  renderLaserBeam(ctx, beam) {
    if (!beam) return;

    ctx.save();
    ctx.lineCap = "round";

    const isTeammate = !!beam.isTeammate;
    const outerColor = isTeammate
      ? "rgba(52, 211, 153, 0.45)"
      : (beam.heat > 0.6 ? "rgba(244, 114, 182, 0.55)" : "rgba(0, 245, 212, 0.45)");

    const coreColor = isTeammate
      ? "#34d399"
      : (beam.heat > 0.6 ? "#f472b6" : "#00f5d4");

    ctx.strokeStyle = outerColor;
    ctx.lineWidth = beam.width * 2.2;
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();

    ctx.strokeStyle = coreColor;
    ctx.lineWidth = beam.width;
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1.5, beam.width * 0.35);
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();

    ctx.restore();
  }

  triggerGameOver() {
    this.running = false;
    sfx.playGameOver();
    const elapsed = Math.max(0, (performance.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const secs = Math.floor(elapsed % 60).toString().padStart(2, "0");
    const stats = {
      mapId: this.mapId,
      wave: this.currentWave,
      maxWaves: this.maxWaves,
      kills: this.kills,
      timeStr: `${mins}:${secs}`,
      seconds: Math.floor(elapsed),
      credits: this.player.credits,
      isHost: this.isHost
    };
    this.onGameOver(stats);
  }

  triggerVictory() {
    this.running = false;
    sfx.playVictory();
    const elapsed = Math.max(0, (performance.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const secs = Math.floor(elapsed % 60).toString().padStart(2, "0");
    const stats = {
      mapId: this.mapId,
      wave: this.currentWave,
      maxWaves: this.maxWaves,
      kills: this.kills,
      timeStr: `${mins}:${secs}`,
      seconds: Math.floor(elapsed),
      credits: this.player.credits,
      isHost: this.isHost
    };
    this.onVictory(stats);
  }

  triggerPlayerDash() {
    if (this.player.isDown || (this.player.dashCooldown || 0) > 0 || this.isArmoryOpen) return;
    let dx = 0, dy = 0;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) dy -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) dy += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) dx -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) dx += 1;
    if (dx === 0 && dy === 0) {
      dx = Math.cos(this.player.angle);
      dy = Math.sin(this.player.angle);
    } else {
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
    }
    this.player.dashActiveTimer = 11;
    this.player.dashCooldown = 165; // ~2.75s
    this.player.dashVx = dx * 15.5;
    this.player.dashVy = dy * 15.5;
    sfx.playSample("cryo", 0.75, 0.05);
    this.addFloatingText(this.player.x, this.player.y - 20, "LƯỚT PHẢN LỰC!", "#38bdf8");
    for (let p = 0; p < 8; p++) {
      this.spawnParticle(this.player.x, this.player.y, -dx * 4 + (Math.random() - 0.5) * 3, -dy * 4 + (Math.random() - 0.5) * 3, "#38bdf8", 3, 10);
    }
    this._notifyPlayerState();
  }

  deployAutoTurret(fromShop = false) {
    if (this.player.isDown) return;
    const activeCount = this.turrets.filter(t => t.active).length;
    if (activeCount >= 4) {
      sfx.playError();
      this.addFloatingText(this.player.x, this.player.y - 25, "ĐÃ ĐẠT TỐI ĐA 4 THÁP PHÁO!", "#f43f5e");
      return;
    }
    if ((this.player.turretCount || 0) <= 0 && this.player.credits < 350) {
      sfx.playError();
      this.addFloatingText(this.player.x, this.player.y - 25, "CẦN $350 HOẶC KHO THÁP PHÁO!", "#f43f5e");
      return;
    }
    if (this.pendingTurretDeploy && this.pendingTurretDeploy.active) {
      return;
    }
    const placeX = this.player.x + Math.cos(this.player.angle) * 28;
    const placeY = this.player.y + Math.sin(this.player.angle) * 28;
    this.pendingTurretDeploy = {
      active: true,
      x: placeX,
      y: placeY,
      angle: this.player.angle,
      elapsedMs: 0,
      durationMs: 3000,
      anchorX: this.player.x,
      anchorY: this.player.y
    };
    sfx.playSample("energy_on", 0.8, 0.05);
    this.addFloatingText(placeX, placeY - 25, "ĐỨNG YÊN 3S TRIỂN KHAI THÁP PHÁO...", "#4ade80");
  }

  getMinimapData() {
    let currentRoom = "TRẠM CHỈ HUY";
    if (this.world && this.world.rooms) {
      for (let i = 0; i < this.world.rooms.length; i++) {
        const r = this.world.rooms[i];
        if (this.player.x >= r.x && this.player.x <= r.x + r.w &&
            this.player.y >= r.y && this.player.y <= r.y + r.h) {
          currentRoom = r.name || "KHU CHIẾN THUẬT";
          break;
        }
      }
    }

    const enemyBlips = [];
    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      const e = this.enemies[i];
      if (e && e.active && e.hp > 0) {
        enemyBlips.push({ x: e.x, y: e.y, isElite: e.isElite });
      }
    }

    const bossBlips = [];
    for (let i = 0; i < this.bosses.length; i++) {
      const b = this.bosses[i];
      if (b && b.active && b.hp > 0) {
        bossBlips.push({ x: b.x, y: b.y, title: b.title });
      }
    }

    return {
      worldW: this.WORLD_W,
      worldH: this.WORLD_H,
      rooms: this.world.rooms || [],
      walls: this.world.walls || [],
      doors: this.world.doors || [],
      generator: this.world.generator,
      nuclearVats: this.world.nuclearVats || [],
      turrets: this.turrets.filter(t => t.active),
      currentRoom,
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        w: this.canvas.width,
        h: this.canvas.height
      },
      player: {
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle,
        isDown: this.player.isDown
      },
      teammate: this.teammate && this.teammate.active ? {
        active: true,
        x: this.teammate.x,
        y: this.teammate.y,
        angle: this.teammate.angle,
        isDown: this.teammate.isDown
      } : null,
      enemyBlips,
      bossBlips
    };
  }

  getArmoryData() {
    return {
      player: {
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        armor: this.player.armor,
        maxArmor: this.player.maxArmor,
        credits: this.player.credits,
        vitalLevel: this.player.vitalLevel,
        speedLevel: this.player.speedLevel,
        dmgLevel: this.player.dmgLevel,
        healCount: this.player.healCount,
        droneCount: this.player.droneCount,
        turretCount: this.player.turretCount,
        hasNvg: this.player.hasNvg,
        damageMultiplier: this.player.damageMultiplier,
        currentWeapon: this.player.currentWeapon
      },
      weapons: this.weapons.map((w, idx) => ({
        id: idx,
        key: w.key,
        name: w.name,
        shortName: w.shortName,
        unlocked: w.unlocked,
        ammo: w.ammo,
        maxAmmo: w.maxAmmo,
        cost: w.cost,
        refillCost: w.refillCost,
        damage: w.damage,
        pellets: w.pellets,
        type: w.type,
        icon: w.icon,
        altIcon: w.altIcon,
        isCurrent: this.player.currentWeapon === idx
      }))
    };
  }

  buyUpgrade(type) {
    if (type === "heal") {
      const maxHeals = 5;
      if (this.player.healCount >= maxHeals) {
        sfx.playError();
        return { success: false, reason: "ĐẠT GIỚI HẠN HỒI PHỤC (5/5)" };
      }
      if (this.player.hp >= this.player.maxHp && this.player.armor >= this.player.maxArmor) {
        sfx.playError();
        return { success: false, reason: "MÁU VÀ GIÁP ĐANG ĐẦY 100%" };
      }
      const cost = 140 + (this.mapId - 1) * 30 + this.player.healCount * 35;
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ HỒI PHỤC` };
      }
      this.player.credits -= cost;
      this.player.hp = this.player.maxHp;
      this.player.armor = this.player.maxArmor;
      this.player.healCount++;
      sfx.playBuy();
      this._notifyPlayerState();
      return { success: true, reason: `ĐÃ HỒI ĐẦY 100% MÁU & GIÁP (${this.player.healCount}/${maxHeals})` };
    }

    if (type === "maxhp") {
      const currentLevel = Math.max(0, this.player.vitalLevel - 1);
      if (currentLevel >= 5) {
        sfx.playError();
        return { success: false, reason: "ĐẠT CẤP TỐI ĐA (5/5)" };
      }
      const cost = Math.round(300 * Math.pow(1.45, currentLevel));
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ NÂNG CẤP` };
      }
      this.player.credits -= cost;
      this.player.maxHp += 30;
      this.player.maxArmor += 30;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
      this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 30);
      this.player.vitalLevel++;
      sfx.playBuy();
      this._notifyPlayerState();
      return { success: true, reason: `TĂNG +30 MÁU & +30 GIÁP (${this.player.vitalLevel - 1}/5)` };
    }

    if (type === "speed") {
      const currentLevel = Math.max(0, this.player.speedLevel - 1);
      if (currentLevel >= 5) {
        sfx.playError();
        return { success: false, reason: "ĐẠT CẤP TỐI ĐA (5/5)" };
      }
      const cost = Math.round(280 * Math.pow(1.48, currentLevel));
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ NÂNG CẤP` };
      }
      this.player.credits -= cost;
      this.player.baseSpeed *= 1.08;
      this.player.speed = this.player.baseSpeed;
      this.player.speedLevel++;
      sfx.playBuy();
      this._notifyPlayerState();
      return { success: true, reason: `TĂNG +8% TỐC CHẠY (${this.player.speedLevel - 1}/5)` };
    }

    if (type === "damage") {
      const currentLevel = Math.max(0, this.player.dmgLevel - 1);
      if (currentLevel >= 5) {
        sfx.playError();
        return { success: false, reason: "ĐẠT CẤP TỐI ĐA (5/5)" };
      }
      const cost = Math.round(420 * Math.pow(1.52, currentLevel));
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ NÂNG CẤP` };
      }
      this.player.credits -= cost;
      this.player.damageMultiplier += 0.20;
      this.player.dmgLevel++;
      this.weapons.forEach(w => {
        if (w.maxAmmo !== Infinity) {
          w.maxAmmo += 50;
          w.ammo = Math.min(w.maxAmmo, w.ammo + 50);
        }
      });
      sfx.playBuy();
      this._notifyPlayerState();
      this._notifyWeaponState();
      return { success: true, reason: `TĂNG +20% SÁT THƯƠNG & +50 ĐẠN (${this.player.dmgLevel - 1}/5)` };
    }

    if (type === "drone") {
      if (this.player.droneCount >= 3) {
        sfx.playError();
        return { success: false, reason: "TỐI ĐA 3 DRONE HỖ TRỢ" };
      }
      const cost = Math.round(650 * Math.pow(1.60, this.player.droneCount));
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ MUA DRONE` };
      }
      this.player.credits -= cost;
      this.player.droneCount++;
      sfx.playBuy();
      this._notifyPlayerState();
      return { success: true, reason: `ĐÃ TRANG BỊ DRONE LASER (${this.player.droneCount}/3)` };
    }

    if (type === "turret") {
      if (this.player.turretCount >= 4) {
        sfx.playError();
        return { success: false, reason: "TỐI ĐA 4 THÁP PHÁO" };
      }
      const cost = 350;
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ TRANG BỊ` };
      }
      this.player.credits -= cost;
      this.player.turretCount++;
      sfx.playBuy();
      this._notifyPlayerState();
      return { success: true, reason: `ĐÃ MỞ KHÓA THÁP PHÁO (${this.player.turretCount}/4)` };
    }

    if (type === "nvg") {
      const cost = 420;
      if (this.player.hasNvg) {
        sfx.playSample("click");
        return { success: true, reason: "KÍNH NHÌN ĐÊM ĐÃ SẴN SÀNG" };
      }
      if (this.player.credits < cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${cost} ĐỂ TRANG BỊ NVG` };
      }
      this.player.credits -= cost;
      this.player.hasNvg = true;
      sfx.playBuy();
      this._notifyPlayerState();
      return { success: true, reason: "ĐÃ TRANG BỊ KÍNH NHÌN ĐÊM NVG" };
    }

    return { success: false, reason: "NÂNG CẤP KHÔNG HỢP LỆ" };
  }

  buyOrRefillWeapon(idx) {
    const w = this.weapons[idx];
    if (!w) return { success: false, reason: "VŨ KHÍ KHÔNG TỒN TẠI" };

    if (!w.unlocked) {
      if (this.player.credits < w.cost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${w.cost} ĐỂ MỞ KHÓA ${w.shortName}` };
      }
      this.player.credits -= w.cost;
      w.unlocked = true;
      w.ammo = w.maxAmmo;
      this.selectWeapon(idx);
      sfx.playBuy();
      this._notifyPlayerState();
      this._notifyWeaponState();
      return { success: true, reason: `ĐÃ MỞ KHÓA & TRANG BỊ ${w.shortName}!` };
    }

    if (w.ammo !== Infinity && w.ammo < w.maxAmmo) {
      const rCost = w.refillCost || 90;
      if (this.player.credits < rCost) {
        sfx.playError();
        return { success: false, reason: `CẦN $${rCost} ĐỂ NẠP ĐẦY ĐẠN` };
      }
      this.player.credits -= rCost;
      w.ammo = w.maxAmmo;
      this.selectWeapon(idx);
      sfx.playBuy();
      this._notifyPlayerState();
      this._notifyWeaponState();
      return { success: true, reason: `ĐÃ NẠP ĐẦY ĐẠN CHO ${w.shortName}!` };
    }

    this.selectWeapon(idx);
    sfx.playSample("click");
    return { success: true, reason: `ĐÃ TRANG BỊ ${w.shortName}!` };
  }

  triggerNuke() {
    if (this.sfx) this.sfx.playExplosion(true);
    this.screenShake = 28;
    this.addFloatingText(this.player.x, this.player.y - 40, "BOM HỦY DIỆT NUKE KÍCH HOẠT!", "#c084fc");
    for (let i = 0; i < this.MAX_ENEMIES; i++) {
      const e = this.enemies[i];
      if (e && e.active) {
        this.damageEnemy(e, 999, 0, 0, "nuke");
      }
    }
    this.bosses.forEach(boss => {
      if (boss && boss.active && boss.hp > 0) {
        this.damageBoss(boss, 550, "nuke");
      }
    });
  }

  renderTeammatePointer(ctx, cw, ch, camX, camY, now) {
    if (!this.teammate || !this.teammate.active) return;

    // Teammate screen coordinates
    const tx = this.teammate.x - camX;
    const ty = this.teammate.y - camY;

    const margin = 55;
    const onScreen = (tx >= margin && tx <= cw - margin && ty >= margin && ty <= ch - margin);

    // If on screen and not downed, no edge indicator needed
    if (onScreen && !this.teammate.isDown) return;

    // Direction vector from player to teammate
    const dx = this.teammate.x - this.player.x;
    const dy = this.teammate.y - this.player.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const cx = cw / 2;
    const cy = ch / 2;
    const halfW = (cw / 2) - margin;
    const halfH = (ch / 2) - margin;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const t = Math.min(
      Math.abs(halfW / (Math.abs(cosA) > 0.0001 ? cosA : 0.0001)),
      Math.abs(halfH / (Math.abs(sinA) > 0.0001 ? sinA : 0.0001))
    );

    const arrowX = cx + cosA * t;
    const arrowY = cy + sinA * t;

    ctx.save();
    ctx.translate(arrowX, arrowY);

    if (this.teammate.isDown) {
      // 🚨 CRITICAL DISTRESS ALERT MODE (DOWNED TEAMMATE)
      const flash = Math.sin(now * 0.012) * 0.5 + 0.5;
      const pulseColor = `rgba(244, 63, 94, ${0.7 + flash * 0.3})`;

      // Expanding radar sonar waves
      const wavePhase = (now * 0.04) % 24;
      ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0, 1 - wavePhase / 24)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + wavePhase, 0, Math.PI * 2);
      ctx.stroke();

      // Warning Arrow pointing in direction of teammate
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = pulseColor;
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(6, -14);
      ctx.lineTo(10, 0);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Medical Cross Badge
      ctx.fillStyle = "rgba(136, 19, 55, 0.95)";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Cross ➕
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-3, -9, 6, 18);
      ctx.fillRect(-9, -3, 18, 6);

      // Warning Tag with Distance (e.g. ⚠️ CỨU ĐỒNG ĐỘI: 450m)
      ctx.shadowBlur = 0;
      ctx.font = "800 11px 'JetBrains Mono', monospace";
      const tagText = `⚠️ CỨU ĐỒNG ĐỘI: ${Math.round(dist)}px`;
      const textW = ctx.measureText(tagText).width;
      
      const tagOffset = (arrowY > cy) ? -32 : 32;
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-textW / 2 - 8, tagOffset - 11, textW + 16, 22, 4);
      } else {
        ctx.rect(-textW / 2 - 8, tagOffset - 11, textW + 16, 22);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fecdd3";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tagText, 0, tagOffset);
    } else {
      // 🎯 NORMAL TACTICAL TEAMMATE RADAR POINTER
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(4, -10);
      ctx.lineTo(7, 0);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Central Tactical Node
      ctx.fillStyle = "rgba(12, 74, 110, 0.9)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.isHost ? "P2" : "P1", 0, 0);

      // Distance Tag
      const tagText = `ĐỒNG ĐỘI: ${Math.round(dist)}px`;
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      const textW = ctx.measureText(tagText).width;
      const tagOffset = (arrowY > cy) ? -24 : 24;

      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-textW / 2 - 6, tagOffset - 9, textW + 12, 18, 3);
      } else {
        ctx.rect(-textW / 2 - 6, tagOffset - 9, textW + 12, 18);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#bae6fd";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tagText, 0, tagOffset);
    }

    ctx.restore();
  }

  getPersistentState() {
    return {
      credits: this.player.credits,
      maxHp: this.player.maxHp,
      maxArmor: this.player.maxArmor,
      speed: this.player.speed,
      healCount: this.player.healCount || 0,
      drones: this.player.droneCount || 0,
      turretCount: this.player.turretCount || 0,
      hasNvg: !!this.player.hasNvg,
      weapons: this.weapons.map(w => ({
        id: w.id,
        unlocked: !!w.unlocked,
        ammo: w.ammo,
        maxAmmo: w.maxAmmo,
        dmgLevel: w.dmgLevel || 0,
        fireRateLevel: w.fireRateLevel || 0,
        ammoLevel: w.ammoLevel || 0
      }))
    };
  }

  restorePersistentState(state) {
    if (!state) return;
    if (typeof state.credits === "number") this.player.credits = state.credits;
    if (typeof state.maxHp === "number") {
      this.player.maxHp = state.maxHp;
      this.player.hp = state.maxHp;
    }
    if (typeof state.maxArmor === "number") {
      this.player.maxArmor = state.maxArmor;
      this.player.armor = state.maxArmor;
    }
    if (typeof state.speed === "number") {
      this.player.speed = state.speed;
      this.player.baseSpeed = state.speed;
    }
    if (typeof state.healCount === "number") this.player.healCount = state.healCount;
    if (typeof state.drones === "number") this.player.droneCount = state.drones;
    if (typeof state.turretCount === "number") this.player.turretCount = state.turretCount;
    if (state.hasNvg) this.player.hasNvg = true;

    if (Array.isArray(state.weapons)) {
      state.weapons.forEach(sw => {
        const w = this.weapons.find(item => item.id === sw.id);
        if (w) {
          w.unlocked = !!sw.unlocked;
          w.maxAmmo = sw.maxAmmo || w.maxAmmo;
          w.ammo = w.maxAmmo;
          w.dmgLevel = sw.dmgLevel || 0;
          w.fireRateLevel = sw.fireRateLevel || 0;
          w.ammoLevel = sw.ammoLevel || 0;
          if (w.baseDamage) {
            w.damage = w.baseDamage * (1 + (w.dmgLevel || 0) * 0.25);
          }
          if (w.baseFireRate) {
            w.fireRate = Math.max(50, w.baseFireRate * (1 - (w.fireRateLevel || 0) * 0.12));
          }
        }
      });
    }
    this._notifyWeaponState();
    this._notifyPlayerState();
  }
}

