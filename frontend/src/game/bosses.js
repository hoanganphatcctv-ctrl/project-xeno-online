/**
 * PROJECT XENO: 10 MULTI-BOSS ROSTER & ADVANCED COMBAT AI
 * Maps 1 to 10 Boss Configurations, Telegraphs, Enraged States & Tactical Skills
 */

export const BOSS_REGISTRY = {
  1: {
    mapId: 1,
    title: "OMEGA BEHEMOTH",
    subtitle: "Chúa Tể Khu Thí Nghiệm Alpha",
    bossCount: 1,
    baseHp: 4200,
    speed: 1.48,
    damage: 30,
    radius: 46,
    themeColor: "#991b1b",
    glowColor: "#f43f5e",
    skills: ["flame", "plasma"]
  },
  2: {
    mapId: 2,
    title: "SONG TRÙM VOID EMPEROR",
    subtitle: "Song Vương Hư Không Tàu Orion-IX",
    bossCount: 2,
    baseHp: 5100,
    speed: 1.68,
    damage: 34,
    radius: 48,
    themeColor: "#431407",
    glowColor: "#f97316",
    skills: ["flame", "plasma"]
  },
  3: {
    mapId: 3,
    title: "TAM TRÙM CRYO LEVIATHAN",
    subtitle: "Tam Quái Thần Băng Trạm Europa",
    bossCount: 3,
    baseHp: 6000,
    speed: 1.86,
    damage: 38,
    radius: 50,
    themeColor: "#082f49",
    glowColor: "#38bdf8",
    skills: ["flame", "plasma"]
  },
  4: {
    mapId: 4,
    title: "TỨ ĐẠI BẠO CHÚA MAGMA",
    subtitle: "Tứ Quỷ Vương Lõi Nham Thạch Núi Lửa",
    bossCount: 4,
    baseHp: 7200,
    speed: 2.05,
    damage: 44,
    radius: 52,
    themeColor: "#7c2d12",
    glowColor: "#ea580c",
    skills: ["quake", "meteor"]
  },
  5: {
    mapId: 5,
    title: "NGŨ ĐẠI BẠO CHÚA HIVE EMPRESS",
    subtitle: "Hội Đồng Nữ Hoàng Thánh Địa Tổ Quỷ",
    bossCount: 5,
    baseHp: 8800,
    speed: 2.20,
    damage: 48,
    radius: 54,
    themeColor: "#581c87",
    glowColor: "#c084fc",
    skills: ["hive_quake", "hive_acid", "hive_plasma"]
  },
  6: {
    mapId: 6,
    title: "LỤC ĐẠI HƯ KHÔNG THẦN // SINGULARITY OVERLORDS",
    subtitle: "Lục Thần Dị Điểm Chân Trời Sự Kiện",
    bossCount: 6,
    baseHp: 10500,
    speed: 2.38,
    damage: 52,
    radius: 55,
    themeColor: "#1e1b4b",
    glowColor: "#22d3ee",
    skills: ["void_nova", "void_laser_fan", "void_meteor_storm"]
  },
  7: {
    mapId: 7,
    title: "THẤT ĐẠI TITAN CƠ KHÍ // CYBER-TITAN OVERLORDS",
    subtitle: "7 Chiến Thần Quỹ Đạo Mecha-Prime",
    bossCount: 7,
    baseHp: 12000,
    speed: 2.45,
    damage: 56,
    radius: 56,
    themeColor: "#78350f",
    glowColor: "#f59e0b",
    skills: ["cyber_rail_sweep", "cyber_emp_nova"]
  },
  8: {
    mapId: 8,
    title: "BÁT ĐẠI THỦY QUÁI ĐÁY VỰC // ABYSSAL KRAKEN LORDS",
    subtitle: "8 Đại Quái Áp Suất Đại Dương Poseidon-X",
    bossCount: 8,
    baseHp: 13500,
    speed: 2.52,
    damage: 60,
    radius: 58,
    themeColor: "#042f2e",
    glowColor: "#06b6d4",
    skills: ["abyss_vortex", "abyss_torpedo_fan"]
  },
  9: {
    mapId: 9,
    title: "CỬU ĐẠI GIÁM NGỤC THỜI GIAN // CHRONO-WARDENS",
    subtitle: "9 Thần Quan Thời Gian Chrono-Ruins",
    bossCount: 9,
    baseHp: 15000,
    speed: 2.60,
    damage: 64,
    radius: 60,
    themeColor: "#713f12",
    glowColor: "#eab308",
    skills: ["chrono_star_burst", "chrono_meteor_rain"]
  },
  10: {
    mapId: 10,
    title: "THẬP ĐẠI THỦY TỔ XENOMORPH // APEX PROGENITORS",
    subtitle: "10 Thần Tối Cao Hành Tinh Mẹ Genesis",
    bossCount: 10,
    baseHp: 18000,
    speed: 2.68,
    damage: 70,
    radius: 64,
    themeColor: "#831843",
    glowColor: "#f43f5e",
    skills: ["genesis_apocalypse", "genesis_void_barrage", "genesis_meteor_cataclysm"]
  }
};

export function getBossConfigForMap(mapId = 1) {
  return BOSS_REGISTRY[mapId] || BOSS_REGISTRY[1];
}

/**
 * Instantiate a Boss entity for the squad
 */
export function createBossInstance(mapId, index, totalBosses, anchorX, anchorY) {
  const cfg = getBossConfigForMap(mapId);
  const multiBossHpFactor = 1 / Math.pow(Math.max(1, totalBosses), 0.22);
  const hpScaled = Math.round(cfg.baseHp * multiBossHpFactor);

  // Spawn spread around anchor
  const ang = (index / totalBosses) * Math.PI * 2;
  const dist = 320;
  const sx = anchorX + Math.cos(ang) * dist;
  const sy = anchorY + Math.sin(ang) * dist;

  return {
    active: true,
    isBoss: true,
    bossIndex: index + 1,
    totalBosses,
    typeKey: "boss",
    mapId,
    name: `${cfg.title} #${index + 1}`,
    title: cfg.title,
    x: sx,
    y: sy,
    hp: hpScaled,
    maxHp: hpScaled,
    speed: cfg.speed,
    damage: cfg.damage,
    radius: cfg.radius,
    reward: Math.round(350 + mapId * 75),
    themeColor: cfg.themeColor,
    glowColor: cfg.glowColor,
    angle: 0,
    hitFlash: 0,
    chillTimer: 0,
    burnTimer: 0,
    enraged: false,
    shield: 0,
    maxShield: Math.round(hpScaled * 0.2),

    // Skill State Machine
    skillState: "idle", // "idle" | "telegraph" | "firing"
    skillType: cfg.skills[index % cfg.skills.length],
    skillTimer: 80 + index * 25,
    maxTelegraphFrames: 60,
    maxFiringFrames: 50,
    skillAngle: 0,
    legPhase: index * 1.5,
    statusText: "Đang truy sát mục tiêu..."
  };
}

/**
 * Update Boss AI State Machine & Combat Logic
 */
export function updateBossAI(boss, target, dt, spawnBullet, sfx, addFloatingText) {
  if (!boss.active || boss.hp <= 0) return;

  const dx = target.x - boss.x;
  const dy = target.y - boss.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Check Enraged state (below 40% HP)
  if (!boss.enraged && boss.hp <= boss.maxHp * 0.4) {
    boss.enraged = true;
    boss.speed *= 1.15;
    boss.shield = boss.maxShield;
    if (sfx) sfx.playExplosion(true);
    if (addFloatingText) {
      addFloatingText(boss.x, boss.y - 40, "CUỒNG NỘ! KÍCH HOẠT KHIÊN HUYẾT TƯƠNG!", "#f43f5e");
    }
  }

  // Look toward target when idle
  if (boss.skillState === "idle") {
    boss.angle = Math.atan2(dy, dx);
    boss.skillTimer--;

    // Movement: Rush toward target if not within melee range
    if (dist > boss.radius + 20) {
      const step = boss.speed * (boss.chillTimer > 0 ? 0.82 : 1.0);
      boss.x += (dx / dist) * step;
      boss.y += (dy / dist) * step;
    }

    boss.legPhase += 0.25;

    // Trigger telegraph state
    if (boss.skillTimer <= 0 && dist < 1100) {
      boss.skillState = "telegraph";
      boss.skillAngle = boss.angle;
      const teleFrames = boss.enraged ? 45 : 65;
      boss.skillTimer = teleFrames;
      boss.maxTelegraphFrames = teleFrames;
      if (sfx) sfx.playSample("monster_ambient", 0.9);
      boss.statusText = `CẢNH BÁO: ĐANG NẠP TUYỆT CHIÊU [${boss.skillType.toUpperCase()}]!`;
    }
  } else if (boss.skillState === "telegraph") {
    // Slowly track target while charging up
    const targetAng = Math.atan2(dy, dx);
    let diff = targetAng - boss.skillAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    boss.skillAngle += diff * 0.05;
    boss.angle = boss.skillAngle;

    boss.skillTimer--;
    if (boss.skillTimer <= 0) {
      boss.skillState = "firing";
      boss.skillTimer = 50;
      boss.maxFiringFrames = 50;
      if (sfx) sfx.playExplosion(false);
      boss.statusText = `XẢ TUYỆT CHIÊU: ${boss.skillType.toUpperCase()}!`;
    }
  } else if (boss.skillState === "firing") {
    boss.skillTimer--;

    // Fire special projectiles according to skillType
    executeBossSkillFire(boss, spawnBullet, sfx);

    if (boss.skillTimer <= 0) {
      boss.skillState = "idle";
      boss.skillTimer = boss.enraged ? 70 : 110;
      boss.statusText = "Đang truy sát mục tiêu...";

      // Rotate skill type to next available skill
      const cfg = getBossConfigForMap(boss.mapId);
      const nextIdx = (cfg.skills.indexOf(boss.skillType) + 1) % cfg.skills.length;
      boss.skillType = cfg.skills[nextIdx];
    }
  }
}

/**
 * Execute Boss Projectile Firing based on skill type
 */
function executeBossSkillFire(boss, spawnBullet, sfx) {
  if (typeof spawnBullet !== "function") return;

  const t = boss.skillTimer;
  const isEnraged = boss.enraged;
  const dmg = Math.round(boss.damage * (isEnraged ? 1.25 : 1.0));

  // 1. 360-Degree Radial Nova (Genesis Apocalypse, Void Nova, Chrono Burst, Cyber EMP)
  if (
    boss.skillType === "genesis_apocalypse" ||
    boss.skillType === "void_nova" ||
    boss.skillType === "chrono_star_burst" ||
    boss.skillType === "abyss_vortex" ||
    boss.skillType === "cyber_emp_nova"
  ) {
    if (t % 10 === 0) {
      const pelletCount = 18;
      const spin = t * 0.08;
      for (let i = 0; i < pelletCount; i++) {
        const ang = (i / pelletCount) * Math.PI * 2 + spin;
        spawnBullet(
          boss.x + Math.cos(ang) * (boss.radius * 0.8),
          boss.y + Math.sin(ang) * (boss.radius * 0.8),
          ang,
          {
            speed: 8.5,
            damage: dmg,
            color: boss.glowColor,
            size: 8.0,
            type: "plasma",
            life: 140
          },
          true
        );
      }
      if (sfx) sfx.playShoot("plasma", 5);
    }
    return;
  }

  // 2. Focused Heavy Barrage Fan (Genesis Void, Void Laser Fan, Cyber Rail Sweep)
  if (
    boss.skillType === "genesis_void_barrage" ||
    boss.skillType === "void_laser_fan" ||
    boss.skillType === "cyber_rail_sweep"
  ) {
    if (t % 7 === 0) {
      const fanCount = 7;
      const muzzleX = boss.x + Math.cos(boss.skillAngle) * (boss.radius + 15);
      const muzzleY = boss.y + Math.sin(boss.skillAngle) * (boss.radius + 15);

      for (let k = -3; k <= 3; k++) {
        const ang = boss.skillAngle + k * 0.12;
        spawnBullet(
          muzzleX,
          muzzleY,
          ang,
          {
            speed: 12.0,
            damage: dmg,
            color: k === 0 ? "#ffffff" : boss.glowColor,
            size: 7.5,
            type: "plasma",
            life: 120
          },
          true
        );
      }
      if (sfx) sfx.playShoot("plasma", 5);
    }
    return;
  }

  // 3. Meteor Shower / Shockwave Orbs (Genesis Meteor, Chrono Rain, Magma Meteor)
  if (
    boss.skillType === "genesis_meteor_cataclysm" ||
    boss.skillType === "chrono_meteor_rain" ||
    boss.skillType === "void_meteor_storm" ||
    boss.skillType === "meteor"
  ) {
    if (t % 12 === 0) {
      const spread = [-0.3, -0.15, 0, 0.15, 0.3];
      spread.forEach(sp => {
        const ang = boss.skillAngle + sp;
        spawnBullet(
          boss.x + Math.cos(ang) * (boss.radius + 20),
          boss.y + Math.sin(ang) * (boss.radius + 20),
          ang,
          {
            speed: 9.5,
            damage: Math.round(dmg * 1.3),
            color: "#ea580c",
            size: 11.0,
            type: "plasma",
            life: 90
          },
          true
        );
      });
      if (sfx) sfx.playExplosion(false);
    }
    return;
  }

  // 4. Toxic Acid Stream / Fire Waves (Flame, Hive Acid, Quake)
  if (t % 5 === 0) {
    const spread = (Math.random() - 0.5) * 0.35;
    spawnBullet(
      boss.x + Math.cos(boss.skillAngle) * (boss.radius + 10),
      boss.y + Math.sin(boss.skillAngle) * (boss.radius + 10),
      boss.skillAngle + spread,
      {
        speed: 10.0,
        damage: Math.round(dmg * 0.75),
        color: boss.glowColor,
        size: 8.5,
        type: "flame",
        life: 45
      },
      true
    );
  }
}

/**
 * Draw Ground Warning Telegraph Rune & Targeting Cone
 */
export function drawBossGroundTelegraph(ctx, boss, now = performance.now()) {
  const isFiring = boss.skillState === "firing";
  const total = isFiring ? boss.maxFiringFrames : boss.maxTelegraphFrames;
  const progress = Math.max(0, Math.min(1, 1 - boss.skillTimer / total));

  ctx.save();
  ctx.translate(boss.x, boss.y);

  // Rotating Runic Octagon Seal
  const spin = now * (isFiring ? 0.008 : 0.003);
  ctx.save();
  ctx.rotate(spin);
  ctx.strokeStyle = boss.glowColor;
  ctx.lineWidth = isFiring ? 3.0 : 2.0;
  ctx.globalAlpha = 0.5 + Math.sin(now * 0.01) * 0.3;

  ctx.beginPath();
  const sides = 8;
  const r = boss.radius * (1.6 + progress * 0.3);
  for (let s = 0; s < sides; s++) {
    const a = (s / sides) * Math.PI * 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Outer Pulse Ring
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius * 2.2 * progress, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Directional Targeting Cone
  ctx.rotate(boss.skillAngle);
  ctx.fillStyle = boss.glowColor;
  ctx.globalAlpha = isFiring ? 0.35 : 0.18 + progress * 0.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 750 * (isFiring ? 1 : progress), -0.28, 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Procedural rendering for all 10 colossal Boss classes
 */
export function drawBossEntity(ctx, boss, now = performance.now()) {
  const r = boss.radius;
  const flash = boss.hitFlash > 0;
  const themeCol = flash ? "#ffffff" : boss.themeColor;
  const glowCol = flash ? "#ffffff" : boss.glowColor;

  ctx.save();
  ctx.translate(boss.x, boss.y);

  // 1. Massive Ground Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.beginPath();
  ctx.arc(0, 8, r * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Enraged Aura Ring
  if (boss.enraged) {
    const pulse = Math.sin(now * 0.015) * 5;
    ctx.strokeStyle = "rgba(244, 63, 94, 0.85)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.45 + pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Nano-Chitin Shield Sphere
  if (boss.shield > 0) {
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.38, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(boss.angle);

  // Heavy Spined Carapace (4 Huge Armor Segments)
  ctx.fillStyle = themeCol;
  ctx.strokeStyle = glowCol;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Spikes protruding from outer ring
  for (let s = 0; s < 6; s++) {
    const sa = (s / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(sa) * (r * 0.9), Math.sin(sa) * (r * 0.9));
    ctx.lineTo(Math.cos(sa) * (r * 1.4), Math.sin(sa) * (r * 1.4));
    ctx.stroke();
  }

  // Inner Bioluminescent Reactor Core
  const corePulse = 0.85 + Math.sin(now * 0.008) * 0.15;
  ctx.fillStyle = glowCol;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45 * corePulse, 0, Math.PI * 2);
  ctx.fill();

  // White-Hot Singularity Point
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Massive Crushing Mandibles
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(r * 0.7, -r * 0.5);
  ctx.lineTo(r * 1.35, -r * 0.2);
  ctx.moveTo(r * 0.7, r * 0.5);
  ctx.lineTo(r * 1.35, r * 0.2);
  ctx.stroke();

  ctx.restore();

  // Overhead Boss Health & Shield Bar
  const bw = 90;
  const bh = 6;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(boss.x - bw / 2, boss.y - r - 22, bw, bh);

  // HP Bar
  ctx.fillStyle = boss.enraged ? "#f43f5e" : "#ef4444";
  ctx.fillRect(boss.x - bw / 2, boss.y - r - 22, bw * Math.max(0, boss.hp / boss.maxHp), bh);

  // Shield Bar
  if (boss.shield > 0 && boss.maxShield > 0) {
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(boss.x - bw / 2, boss.y - r - 28, bw * Math.min(1, boss.shield / boss.maxShield), 4);
  }

  // Label text
  ctx.font = "800 10px 'JetBrains Mono', monospace";
  ctx.fillStyle = boss.enraged ? "#f43f5e" : "#fde047";
  ctx.textAlign = "center";
  ctx.fillText(
    boss.enraged ? `CUỒNG NỘ // BOSS #${boss.bossIndex}` : `BOSS #${boss.bossIndex}`,
    boss.x,
    boss.y - r - (boss.shield > 0 ? 32 : 26)
  );
  ctx.restore();
}

