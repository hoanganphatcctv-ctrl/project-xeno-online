/**
 * PROJECT XENO: ITEM DROPS & TACTICAL POWER-UPS SYSTEM
 * Individual Wallet Rule: Picked credits directly belong to the collecting player!
 */

export const ITEM_DEFINITIONS = {
  medkit: {
    id: "medkit",
    icon: "HP",
    label: "+45 MÁU",
    color: "#f43f5e",
    bg: "#881337",
    glow: "rgba(244, 63, 94, 0.45)"
  },
  armor: {
    id: "armor",
    icon: "ARM",
    label: "+50 GIÁP NANO",
    color: "#38bdf8",
    bg: "#0c4a6e",
    glow: "rgba(56, 189, 248, 0.45)"
  },
  cash: {
    id: "cash",
    icon: "$$$",
    label: "VALI TIỀN",
    color: "#fbbf24",
    bg: "#78350f",
    glow: "rgba(251, 191, 36, 0.45)"
  },
  speed: {
    id: "speed",
    icon: "SPD",
    label: "TĂNG TỐC 8S",
    color: "#fde047",
    bg: "#713f12",
    glow: "rgba(253, 224, 71, 0.45)"
  },
  freeze: {
    id: "freeze",
    icon: "CRYO",
    label: "ĐÓNG BĂNG 5S",
    color: "#67e8f9",
    bg: "#164e63",
    glow: "rgba(103, 232, 249, 0.45)"
  },
  overdrive: {
    id: "overdrive",
    icon: "X2",
    label: "CUỒNG NỘ X2",
    color: "#fb923c",
    bg: "#7c2d12",
    glow: "rgba(251, 146, 60, 0.45)"
  },
  nuke: {
    id: "nuke",
    icon: "NUKE",
    label: "BOM HỦY DIỆT",
    color: "#c084fc",
    bg: "#4c1d95",
    glow: "rgba(192, 132, 252, 0.45)"
  }
};

export class ItemManager {
  constructor(maxItems = 70) {
    this.MAX_ITEMS = maxItems;
    this.items = Array.from({ length: this.MAX_ITEMS }, (_, i) => ({
      id: i,
      active: false,
      x: 0,
      y: 0,
      kind: "cash",
      life: 1400,
      bobPhase: 0
    }));
  }

  spawnDrop(x, y, forcedKind = null) {
    for (let i = 0; i < this.MAX_ITEMS; i++) {
      const it = this.items[i];
      if (!it.active) {
        let kind = forcedKind;
        if (!kind) {
          const r = Math.random();
          if (r < 0.28) kind = "medkit";
          else if (r < 0.50) kind = "armor";
          else if (r < 0.72) kind = "cash";
          else if (r < 0.82) kind = "speed";
          else if (r < 0.90) kind = "freeze";
          else if (r < 0.96) kind = "overdrive";
          else kind = "nuke";
        }
        it.active = true;
        it.x = x;
        it.y = y;
        it.kind = kind;
        it.life = 1400; // ~23 seconds before fading
        it.bobPhase = Math.random() * Math.PI * 2;
        return it;
      }
    }
    return null;
  }

  syncFromHost(remoteItems) {
    if (!Array.isArray(remoteItems)) return;
    const activeIds = new Set();
    for (let k = 0; k < remoteItems.length; k++) {
      const ri = remoteItems[k];
      activeIds.add(ri.id);
      const it = this.items[ri.id];
      if (it) {
        it.active = true;
        it.kind = ri.k || "cash";
        it.x = ri.x;
        it.y = ri.y;
        if (it.life <= 0) it.life = 1400;
      }
    }
    for (let i = 0; i < this.MAX_ITEMS; i++) {
      if (!activeIds.has(i) && this.items[i].active) {
        this.items[i].active = false;
      }
    }
  }

  collectActiveItems() {
    const list = [];
    for (let i = 0; i < this.MAX_ITEMS; i++) {
      const it = this.items[i];
      if (it.active) {
        list.push({
          id: it.id,
          k: it.kind,
          x: Math.round(it.x),
          y: Math.round(it.y)
        });
      }
    }
    return list;
  }

  update(players, dt, onActivatePowerup, onPickItem = null) {
    for (let i = 0; i < this.MAX_ITEMS; i++) {
      const it = this.items[i];
      if (!it.active) continue;

      it.life--;
      it.bobPhase += 0.08;

      if (it.life <= 0) {
        it.active = false;
        continue;
      }

      // Magnetic attraction toward closest active player
      for (let pIdx = 0; pIdx < players.length; pIdx++) {
        const player = players[pIdx];
        if (!player || player.isDown) continue;

        const d = Math.hypot(it.x - player.x, it.y - player.y);

        // Magnetic drift within 120px
        if (d < 120) {
          it.x += (player.x - it.x) * 0.16;
          it.y += (player.y - it.y) * 0.16;
        }

        // Pickup threshold
        if (d < player.radius + 18) {
          it.active = false;
          if (typeof onActivatePowerup === "function") {
            onActivatePowerup(it.kind, player, it.x, it.y);
          }
          if (typeof onPickItem === "function") {
            onPickItem(it.id, it.kind, player);
          }
          break;
        }
      }
    }
  }

  render(ctx, now = performance.now()) {
    for (let i = 0; i < this.MAX_ITEMS; i++) {
      const it = this.items[i];
      if (!it.active) continue;

      const meta = ITEM_DEFINITIONS[it.kind] || ITEM_DEFINITIONS.cash;
      const bob = Math.sin(it.bobPhase) * 3.5;
      const alpha = Math.min(1.0, it.life / 60);

      ctx.save();
      ctx.translate(it.x, it.y + bob);
      ctx.globalAlpha = alpha;

      // Outer Pulsing Glow
      const pulse = 1.0 + Math.sin(now * 0.008 + it.bobPhase) * 0.2;
      ctx.fillStyle = meta.glow;
      ctx.beginPath();
      ctx.arc(0, 0, 16 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main Item Diamond/Octagon Badge
      ctx.fillStyle = meta.bg;
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 2.0;

      ctx.beginPath();
      const r = 12;
      ctx.moveTo(-r, 0);
      ctx.lineTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Icon symbol
      ctx.font = "800 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(meta.icon, 0, 0);

      // Floating Name Label
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = meta.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(meta.label, 0, -18);

      ctx.restore();
    }
  }
}

/**
 * Handle Item Activation according to rules
 */
export function activateItemPowerup(kind, player, x, y, engine) {
  if (engine.sfx) {
    engine.sfx.playPickup(kind);
  }

  if (kind === "medkit") {
    player.hp = Math.min(player.maxHp, player.hp + 45);
    engine.addFloatingText(x, y, "+45 MÁU", "#f43f5e");
  } else if (kind === "armor") {
    player.armor = Math.min(player.maxArmor, player.armor + 50);
    engine.addFloatingText(x, y, "+50 GIÁP NANO", "#38bdf8");
  } else if (kind === "cash") {
    // Individual Wallet Rule: Player collecting cash receives it directly!
    const reward = 35 + Math.floor(Math.random() * 35);
    player.credits += reward;
    engine.addFloatingText(x, y, `+$${reward}`, "#fbbf24");
  } else if (kind === "speed") {
    player.speedBuffTimer = 8 * 60; // 8 seconds
    player.speed = 5.2; // Fast adrenaline
    engine.addFloatingText(x, y, "TĂNG TỐC ADRENALINE 8S!", "#fde047");
  } else if (kind === "freeze") {
    engine.globalFreezeTimer = 5 * 60; // 5 seconds freeze
    if (engine.sfx) engine.sfx.playFreeze();
    engine.addFloatingText(x, y, "ĐÓNG BĂNG QUÁI 5 GIÂY!", "#67e8f9");
  } else if (kind === "overdrive") {
    player.overdriveBuffTimer = 8 * 60;
    engine.addFloatingText(x, y, "CUỒNG NỘ OVERDRIVE X2!", "#fb923c");
  } else if (kind === "nuke") {
    // Screen-wide tactical warhead detonation
    if (engine.sfx) engine.sfx.playExplosion(true);
    engine.screenShake = 28;
    engine.addFloatingText(x, y, "BOM HỦY DIỆT NUKE KÍCH HOẠT!", "#c084fc");

    // Eliminate regular enemies & blast bosses
    for (let i = 0; i < engine.MAX_ENEMIES; i++) {
      const e = engine.enemies[i];
      if (e.active) {
        engine.damageEnemy(e, 999, 0, 0, "nuke");
      }
    }
    engine.bosses.forEach(boss => {
      if (boss.active && boss.hp > 0) {
        engine.damageBoss(boss, 550, "nuke");
      }
    });
  }

  if (typeof engine._notifyPlayerState === "function") {
    engine._notifyPlayerState();
  }
}
