/**
 * PROJECT XENO: XENOMORPH ENEMY SYSTEM & PROCEDURAL RENDERING
 * 5 Xenomorph Classes: Crawler, Stalker, Spitter, Brute, and Elite Praetorian
 */

export const ENEMY_TYPES = {
  crawler: {
    typeKey: "crawler",
    name: "Crawler Xeno",
    hp: 38,
    speed: 2.38,
    radius: 14,
    damage: 7,
    reward: 3,
    bodyColor: "#16a34a",
    carapaceColor: "#064e3b",
    eyeColor: "#ef4444",
    legs: 3,
    ranged: false
  },
  stalker: {
    typeKey: "stalker",
    name: "Razor Stalker",
    hp: 72,
    speed: 2.82,
    radius: 16,
    damage: 11,
    reward: 5,
    bodyColor: "#0d9488",
    carapaceColor: "#134e4a",
    eyeColor: "#fde047",
    legs: 4,
    ranged: false
  },
  spitter: {
    typeKey: "spitter",
    name: "Acid Spitter",
    hp: 96,
    speed: 1.95,
    radius: 17,
    damage: 11,
    reward: 7,
    bodyColor: "#65a30d",
    carapaceColor: "#365314",
    eyeColor: "#bef264",
    legs: 4,
    ranged: true
  },
  brute: {
    typeKey: "brute",
    name: "Brood Brute",
    hp: 270,
    speed: 1.46,
    radius: 25,
    damage: 19,
    reward: 15,
    bodyColor: "#dc2626",
    carapaceColor: "#450a0a",
    eyeColor: "#38bdf8",
    legs: 4,
    ranged: false
  },
  praetorian: {
    typeKey: "praetorian",
    name: "Xeno Praetorian",
    hp: 420,
    speed: 2.68,
    radius: 23,
    damage: 22,
    reward: 26,
    bodyColor: "#9333ea",
    carapaceColor: "#3b0764",
    eyeColor: "#4ade80",
    legs: 4,
    ranged: true,
    isElite: true,
    burstTriShot: true
  }
};

/**
 * Pick an enemy type based on current wave progression
 */
export function pickEnemyTypeForWave(wave = 1) {
  const r = Math.random();
  if (wave <= 1) {
    return r < 0.65 ? "crawler" : "stalker";
  } else if (wave === 2) {
    if (r < 0.45) return "crawler";
    if (r < 0.80) return "stalker";
    return "spitter";
  } else if (wave === 3) {
    if (r < 0.30) return "crawler";
    if (r < 0.60) return "stalker";
    if (r < 0.85) return "spitter";
    return "brute";
  } else {
    if (r < 0.20) return "crawler";
    if (r < 0.45) return "stalker";
    if (r < 0.70) return "spitter";
    if (r < 0.88) return "brute";
    return "praetorian";
  }
}

function safeArc(c, x, y, r, sAng = 0, eAng = Math.PI * 2) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const rad = Number.isFinite(r) ? Math.max(0.5, r) : 1;
  c.arc(x, y, rad, sAng, eAng);
}

/**
 * Procedural rendering for all 5 authentic Xenomorph classes
 * Ported from Alien Shooter Original Engine: Crawler, Stalker, Brute, Spitter, and Praetorian
 */
export function drawXenomorphMonster(ctx, e, now = performance.now()) {
  const r = Math.max(8, e.radius || 14);
  const flash = e.hitFlash > 0;
  const isChilled = e.chillTimer > 0;

  ctx.save();
  ctx.translate(e.x, e.y);

  // 1. Ground Contact Shadow
  ctx.fillStyle = "rgba(2, 6, 18, 0.52)";
  ctx.beginPath();
  safeArc(ctx, 0, 3, r * 1.1);
  ctx.fill();

  // Chill / Slow Ring
  if (isChilled) {
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    safeArc(ctx, 0, 0, r * 1.32);
    ctx.stroke();
  }

  // Elite Sub-Boss / Praetorian Aura
  if (e.isElite) {
    const pulse = Math.sin(now * 0.008) * 3;
    ctx.strokeStyle = "rgba(168, 85, 247, 0.65)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    safeArc(ctx, 0, 0, r * 1.38 + pulse);
    ctx.stroke();
  }

  ctx.rotate(e.angle);

  const shellCol = flash ? "#ffffff" : (isChilled ? "#0369a1" : e.carapaceColor);
  const fleshCol = flash ? "#ffffff" : (isChilled ? "#0284c7" : e.bodyColor);
  const clawCol  = flash ? "#ffffff" : (isChilled ? "#bae6fd" : (e.isElite ? "#4ade80" : "#e2e8f0"));
  const spikeCol = flash ? "#ffffff" : (isChilled ? "#7dd3fc" : (e.isElite ? "#d8b4fe" : "#fca5a5"));

  // =========================================================================
  // 1. CRAWLER XENO (SPINED VENOM SWARMER)
  // =========================================================================
  if (e.typeKey === "crawler") {
    const venomCol = flash ? "#ffffff" : (isChilled ? "#7dd3fc" : "#4ade80");
    const bloodTip = flash ? "#ffffff" : (isChilled ? "#bae6fd" : "#ef4444");
    const darkArmor = flash ? "#ffffff" : (isChilled ? "#0c4a6e" : "#052e16");
    const tailWag = Math.sin(e.legPhase * 0.95) * (r * 0.42);

    // Segmented Scorpion Whip-Tail with Barbs & Venom Stinger
    const t1x = -r * 0.85, t1y = tailWag * 0.25;
    const t2x = -r * 1.38, t2y = tailWag * 0.65;
    const t3x = -r * 1.92, t3y = tailWag;
    ctx.strokeStyle = darkArmor;
    ctx.lineWidth = Math.max(2.6, r * 0.24);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, 0);
    ctx.lineTo(t1x, t1y);
    ctx.lineTo(t2x, t2y);
    ctx.lineTo(t3x, t3y);
    ctx.stroke();

    // Lateral Tail Spikes along segments
    ctx.fillStyle = spikeCol;
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(t1x, t1y);
      ctx.lineTo(t1x - r * 0.22, t1y + s * r * 0.34);
      ctx.lineTo(t1x + r * 0.12, t1y + s * r * 0.08);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(t2x, t2y);
      ctx.lineTo(t2x - r * 0.20, t2y + s * r * 0.28);
      ctx.lineTo(t2x + r * 0.10, t2y + s * r * 0.06);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing Barbed Scorpion Stinger Tip
    ctx.fillStyle = bloodTip;
    ctx.beginPath();
    ctx.moveTo(t3x - r * 0.42, t3y + tailWag * 0.18);
    ctx.lineTo(t3x + r * 0.08, t3y - r * 0.18);
    ctx.lineTo(t3x - r * 0.06, t3y);
    ctx.lineTo(t3x + r * 0.08, t3y + r * 0.18);
    ctx.closePath();
    ctx.fill();

    // 3 Pairs of Razor-Spined Arachnid Legs
    for (let side = -1; side <= 1; side += 2) {
      for (let l = 0; l < 3; l++) {
        const offsetRatio = (l - 1) * 0.52;
        const stride = Math.sin(e.legPhase + l * 1.65 + (side === 1 ? 0 : Math.PI)) * (r * 0.32);

        const rootX = offsetRatio * r * 0.85;
        const rootY = side * r * 0.36;
        const kneeX = rootX + stride * 0.6 + (l === 0 ? r * 0.18 : (l === 2 ? -r * 0.18 : 0));
        const kneeY = side * (r * 1.15 + (l === 1 ? r * 0.18 : 0));
        const tipX  = kneeX + stride * 0.85 + (l === 0 ? r * 0.38 : -r * 0.28);
        const tipY  = side * (r * 1.68);

        // Armored Femur
        ctx.strokeStyle = darkArmor;
        ctx.lineWidth = Math.max(2.4, r * 0.20);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        // Sharp Blade Tarsus
        ctx.fillStyle = clawCol;
        ctx.beginPath();
        ctx.moveTo(kneeX - r * 0.09, kneeY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(kneeX + r * 0.11, kneeY - side * r * 0.08);
        ctx.closePath();
        ctx.fill();

        // Protruding Knee Thorn
        ctx.fillStyle = spikeCol;
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(kneeX + r * 0.16, kneeY + side * r * 0.28);
        ctx.lineTo(kneeX - r * 0.10, kneeY + side * r * 0.06);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Dual Serrated Mantis Scythe-Claws with Inner Saw-Teeth
    const pinch = Math.sin(e.legPhase * 1.25) * 0.22;
    const clawReach = r * 1.48;
    for (let side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(r * 0.42, side * r * 0.45);
      ctx.rotate(side * (0.36 - pinch));

      ctx.fillStyle = clawCol;
      ctx.strokeStyle = darkArmor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(clawReach * 0.45, side * r * 0.36);
      ctx.lineTo(clawReach * 1.05, -side * r * 0.12);
      ctx.lineTo(clawReach * 0.72, -side * r * 0.02);
      ctx.lineTo(clawReach * 0.58, side * r * 0.12);
      ctx.lineTo(clawReach * 0.45, -side * r * 0.04);
      ctx.lineTo(clawReach * 0.30, side * r * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blood/Venom Stained Razor Tip
      ctx.fillStyle = bloodTip;
      ctx.beginPath();
      ctx.moveTo(clawReach * 0.65, side * r * 0.16);
      ctx.lineTo(clawReach * 1.05, -side * r * 0.12);
      ctx.lineTo(clawReach * 0.72, -side * r * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Lateral Chitinous Side-Thorns jutting from Abdomen & Thorax
    ctx.fillStyle = spikeCol;
    for (let side = -1; side <= 1; side += 2) {
      for (let k = -1; k <= 1; k++) {
        const bx = k * r * 0.36 - r * 0.1;
        const by = side * r * 0.52;
        ctx.beginPath();
        ctx.moveTo(bx + r * 0.14, by * 0.7);
        ctx.lineTo(bx - r * 0.28, side * r * 0.96);
        ctx.lineTo(bx - r * 0.14, by * 0.7);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Segmented Abdomen
    ctx.fillStyle = darkArmor;
    ctx.strokeStyle = venomCol;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.52);
    ctx.lineTo(-r * 0.62, -r * 0.64);
    ctx.lineTo(-r * 1.08, 0);
    ctx.lineTo(-r * 0.62, r * 0.64);
    ctx.lineTo(0, r * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spiked Armored Thorax & Razor Head-Plate
    ctx.fillStyle = fleshCol;
    ctx.strokeStyle = darkArmor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(r * 0.98, 0);
    ctx.lineTo(r * 0.52, -r * 0.68);
    ctx.lineTo(-r * 0.25, -r * 0.58);
    ctx.lineTo(-r * 0.52, 0);
    ctx.lineTo(-r * 0.25, r * 0.58);
    ctx.lineTo(r * 0.52, r * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Bio-Venom Dorsal Fissure & Spines
    ctx.strokeStyle = venomCol;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.78, 0);
    ctx.lineTo(r * 0.45, 0);
    ctx.stroke();

    ctx.fillStyle = bloodTip;
    for (let s = -2; s <= 1; s++) {
      const sx = s * r * 0.34;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.24, 0);
      ctx.lineTo(sx - r * 0.22, -r * 0.24);
      ctx.lineTo(sx - r * 0.12, 0);
      ctx.lineTo(sx - r * 0.22, r * 0.24);
      ctx.closePath();
      ctx.fill();
    }

    // Mandibles at Front
    ctx.fillStyle = clawCol;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(r * 0.78, side * r * 0.18);
      ctx.lineTo(r * 1.26, side * r * 0.05);
      ctx.lineTo(r * 0.88, side * r * 0.36);
      ctx.closePath();
      ctx.fill();
    }

    // 4 Compound Eyes
    ctx.fillStyle = isChilled ? "#e0f2fe" : e.eyeColor;
    ctx.beginPath();
    safeArc(ctx, r * 0.68, -r * 0.22, 2.2);
    safeArc(ctx, r * 0.68,  r * 0.22, 2.2);
    safeArc(ctx, r * 0.48, -r * 0.36, 1.7);
    safeArc(ctx, r * 0.48,  r * 0.36, 1.7);
    ctx.fill();
  }
  // =========================================================================
  // 2. RAZOR STALKER (BLADED RAPTOR ASSASSIN)
  // =========================================================================
  else if (e.typeKey === "stalker") {
    const darkChitin = flash ? "#ffffff" : (isChilled ? "#0c4a6e" : "#042f2e");
    const bladeEdge  = flash ? "#ffffff" : (isChilled ? "#e0f2fe" : "#f8fafc");
    const neonEdge   = flash ? "#ffffff" : (isChilled ? "#38bdf8" : "#2dd4bf");
    const goldEye    = flash ? "#ffffff" : (isChilled ? "#bae6fd" : "#fde047");

    // Twin Whip-Tails with Crescent Executioner Blades
    for (let tSide = -1; tSide <= 1; tSide += 2) {
      const wag = Math.sin(e.legPhase * 0.95 + (tSide === 1 ? 0 : 1.4)) * (r * 0.38);
      const endX = -r * 1.98;
      const endY = tSide * r * 0.36 + wag;

      ctx.strokeStyle = darkChitin;
      ctx.lineWidth = Math.max(2.4, r * 0.19);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r * 0.68, tSide * r * 0.18);
      ctx.quadraticCurveTo(-r * 1.35, tSide * r * 0.52 + wag * 0.5, endX, endY);
      ctx.stroke();

      ctx.fillStyle = bladeEdge;
      ctx.beginPath();
      ctx.moveTo(endX + r * 0.18, endY - tSide * r * 0.12);
      ctx.lineTo(endX - r * 0.45, endY + tSide * r * 0.16);
      ctx.lineTo(endX - r * 0.12, endY - tSide * r * 0.24);
      ctx.closePath();
      ctx.fill();
    }

    // 4 Pairs of Swept-Back Bladed Raptor Legs with Long Knee Spurs
    for (let side = -1; side <= 1; side += 2) {
      for (let l = 0; l < 4; l++) {
        const offsetRatio = (l - 1.5) * 0.46;
        const stride = Math.sin(e.legPhase + l * 1.55 + (side === 1 ? 0 : Math.PI)) * (r * 0.32);

        const rootX = offsetRatio * r * 0.92;
        const rootY = side * r * 0.38;
        const kneeX = rootX + stride * 0.6 - r * 0.10;
        const kneeY = side * (r * 1.18 + (l === 1 || l === 2 ? r * 0.18 : 0));
        const tipX  = kneeX + stride * 0.85 + (l < 2 ? r * 0.35 : -r * 0.32);
        const tipY  = side * (r * 1.72);

        ctx.strokeStyle = darkChitin;
        ctx.lineWidth = Math.max(2.2, r * 0.18);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        ctx.fillStyle = bladeEdge;
        ctx.beginPath();
        ctx.moveTo(kneeX - r * 0.08, kneeY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(kneeX + r * 0.12, kneeY - side * r * 0.08);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = neonEdge;
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(kneeX - r * 0.28, kneeY + side * r * 0.26);
        ctx.lineTo(kneeX + r * 0.08, kneeY + side * r * 0.05);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Colossal Double-Edged Reaper Scythes
    const slash = Math.sin(e.legPhase * 1.2) * 0.24;
    const scytheReach = r * 1.82;
    for (let side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(r * 0.44, side * r * 0.48);
      ctx.rotate(side * (0.28 - slash));

      ctx.strokeStyle = darkChitin;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(scytheReach * 0.42, side * r * 0.38);
      ctx.stroke();

      ctx.fillStyle = bladeEdge;
      ctx.strokeStyle = neonEdge;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(scytheReach * 0.25, side * r * 0.26);
      ctx.quadraticCurveTo(scytheReach * 0.72, side * r * 0.56, scytheReach, -side * r * 0.18);
      ctx.lineTo(scytheReach * 0.74, -side * r * 0.04);
      ctx.lineTo(scytheReach * 0.66, side * r * 0.16);
      ctx.lineTo(scytheReach * 0.54, 0);
      ctx.lineTo(scytheReach * 0.44, side * r * 0.18);
      ctx.lineTo(scytheReach * 0.32, side * r * 0.04);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Swept-Wing Shoulder Blades & Carapace Plates
    ctx.fillStyle = darkChitin;
    ctx.strokeStyle = neonEdge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, 0);
    ctx.lineTo(-r * 0.22, -r * 0.98);
    ctx.lineTo(-r * 0.45, -r * 0.52);
    ctx.lineTo(-r * 1.12, 0);
    ctx.lineTo(-r * 0.45, r * 0.52);
    ctx.lineTo(-r * 0.22, r * 0.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Horned Raptor Thorax & Crest
    ctx.fillStyle = fleshCol;
    ctx.strokeStyle = darkChitin;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(r * 1.15, 0);
    ctx.lineTo(r * 0.55, -r * 0.58);
    ctx.lineTo(-r * 0.38, -r * 0.85);
    ctx.lineTo(-r * 0.18, -r * 0.38);
    ctx.lineTo(-r * 0.62, 0);
    ctx.lineTo(-r * 0.18, r * 0.38);
    ctx.lineTo(-r * 0.38, r * 0.85);
    ctx.lineTo(r * 0.55, r * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6 Golden Hunter Eyes
    ctx.fillStyle = goldEye;
    for (let eIdx = 0; eIdx < 3; eIdx++) {
      const ex = r * (0.78 - eIdx * 0.16);
      const ey = r * (0.16 + eIdx * 0.10);
      ctx.beginPath();
      safeArc(ctx, ex, -ey, 1.9);
      safeArc(ctx, ex,  ey, 1.9);
      ctx.fill();
    }
  }
  // =========================================================================
  // 3. BROOD BRUTE (SPIKED SIEGE JUGGERNAUT)
  // =========================================================================
  else if (e.typeKey === "brute") {
    const darkPlate = flash ? "#ffffff" : (isChilled ? "#0c4a6e" : "#2a0606");
    const crimson   = flash ? "#ffffff" : (isChilled ? "#0284c7" : "#dc2626");
    const magmaVein = flash ? "#ffffff" : (isChilled ? "#7dd3fc" : "#fb923c");
    const boneHorn  = flash ? "#ffffff" : (isChilled ? "#e0f2fe" : "#fef2f2");

    // Heavy Segmented Tail Ending in a 6-Spiked Morning-Star Bone Club
    const clubWag = Math.sin(e.legPhase * 0.8) * (r * 0.36);
    const clubX = -r * 1.72;
    const clubY = clubWag;

    ctx.strokeStyle = darkPlate;
    ctx.lineWidth = Math.max(4.5, r * 0.26);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, 0);
    ctx.quadraticCurveTo(-r * 1.22, clubWag * 0.5, clubX, clubY);
    ctx.stroke();

    ctx.fillStyle = crimson;
    ctx.strokeStyle = darkPlate;
    ctx.lineWidth = 2;
    ctx.beginPath();
    safeArc(ctx, clubX, clubY, r * 0.28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = boneHorn;
    for (let k = 0; k < 6; k++) {
      const sa = (k / 6) * Math.PI * 2 + clubWag * 0.05;
      ctx.beginPath();
      ctx.moveTo(clubX + Math.cos(sa - 0.25) * r * 0.22, clubY + Math.sin(sa - 0.25) * r * 0.22);
      ctx.lineTo(clubX + Math.cos(sa) * r * 0.52, clubY + Math.sin(sa) * r * 0.52);
      ctx.lineTo(clubX + Math.cos(sa + 0.25) * r * 0.22, clubY + Math.sin(sa + 0.25) * r * 0.22);
      ctx.closePath();
      ctx.fill();
    }

    // 4 Pairs of Heavy Pillar-Legs with Knee Horns
    for (let side = -1; side <= 1; side += 2) {
      for (let l = 0; l < 4; l++) {
        const offsetRatio = (l - 1.5) * 0.44;
        const stride = Math.sin(e.legPhase + l * 1.45 + (side === 1 ? 0 : Math.PI)) * (r * 0.24);

        const rootX = offsetRatio * r * 0.90;
        const rootY = side * r * 0.46;
        const kneeX = rootX + stride * 0.55;
        const kneeY = side * (r * 1.15 + (l === 1 || l === 2 ? r * 0.14 : 0));
        const tipX  = kneeX + stride * 0.72 + (l < 2 ? r * 0.22 : -r * 0.22);
        const tipY  = side * (r * 1.56);

        ctx.strokeStyle = darkPlate;
        ctx.lineWidth = Math.max(4.2, r * 0.22);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = boneHorn;
        ctx.beginPath();
        ctx.moveTo(kneeX - r * 0.10, kneeY);
        ctx.lineTo(kneeX + r * 0.08, kneeY + side * r * 0.30);
        ctx.lineTo(kneeX + r * 0.12, kneeY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Bull Siege Horns on Shoulders & Crusher Claws
    const crush = Math.sin(e.legPhase * 1.05) * 0.16;
    const pincerReach = r * 1.56;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = boneHorn;
      ctx.strokeStyle = darkPlate;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r * 0.18, side * r * 0.65);
      ctx.quadraticCurveTo(r * 0.75, side * r * 1.12, r * 1.28, side * r * 0.62);
      ctx.quadraticCurveTo(r * 0.72, side * r * 0.78, r * 0.35, side * r * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(r * 0.48, side * r * 0.50);
      ctx.rotate(side * (0.28 - crush));

      ctx.fillStyle = darkPlate;
      ctx.strokeStyle = magmaVein;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -side * r * 0.12);
      ctx.lineTo(pincerReach * 0.48, side * r * 0.45);
      ctx.lineTo(pincerReach, -side * r * 0.08);
      ctx.lineTo(pincerReach * 0.74, -side * r * 0.16);
      ctx.lineTo(pincerReach * 0.58, side * r * 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Heavy Octagonal Armored Abdomen & Carapace
    ctx.fillStyle = darkPlate;
    ctx.strokeStyle = magmaVein;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.68);
    ctx.lineTo(-r * 0.68, -r * 0.72);
    ctx.lineTo(-r * 1.08, 0);
    ctx.lineTo(-r * 0.68, r * 0.72);
    ctx.lineTo(0, r * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = crimson;
    ctx.strokeStyle = darkPlate;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(r * 0.98, 0);
    ctx.lineTo(r * 0.62, -r * 0.74);
    ctx.lineTo(-r * 0.28, -r * 0.80);
    ctx.lineTo(-r * 0.62, 0);
    ctx.lineTo(-r * 0.28, r * 0.80);
    ctx.lineTo(r * 0.62, r * 0.74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bio-Furnace Core
    ctx.fillStyle = magmaVein;
    ctx.beginPath();
    safeArc(ctx, 0, 0, r * 0.26);
    ctx.fill();

    // Eyes
    ctx.fillStyle = isChilled ? "#e0f2fe" : e.eyeColor;
    for (let eIdx = 0; eIdx < 3; eIdx++) {
      const ex = r * (0.72 - eIdx * 0.14);
      const ey = r * (0.18 + eIdx * 0.12);
      ctx.beginPath();
      safeArc(ctx, ex, -ey, 2.3);
      safeArc(ctx, ex,  ey, 2.3);
      ctx.fill();
    }
  }
  // =========================================================================
  // 4. ACID SPITTER (CORROSIVE ARTILLERY XENO)
  // =========================================================================
  else if (e.typeKey === "spitter") {
    const darkChitin = flash ? "#ffffff" : (isChilled ? "#0c4a6e" : "#1a2e05");
    const toxicLime  = flash ? "#ffffff" : (isChilled ? "#7dd3fc" : "#a3e635");
    const brightAcid = flash ? "#ffffff" : (isChilled ? "#e0f2fe" : "#d9f99d");
    const thornCol   = flash ? "#ffffff" : (isChilled ? "#bae6fd" : "#ecfccb");

    // Segmented Barbed Acid-Mortar Tail with Bio-Nozzle Tip
    const tailWag = Math.sin(e.legPhase * 0.92) * (r * 0.40);
    const t1x = -r * 0.86, t1y = tailWag * 0.28;
    const t2x = -r * 1.42, t2y = tailWag * 0.68;
    const t3x = -r * 1.96, t3y = tailWag;

    ctx.strokeStyle = darkChitin;
    ctx.lineWidth = Math.max(3.0, r * 0.22);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, 0);
    ctx.lineTo(t1x, t1y);
    ctx.lineTo(t2x, t2y);
    ctx.lineTo(t3x, t3y);
    ctx.stroke();

    ctx.fillStyle = toxicLime;
    ctx.beginPath();
    safeArc(ctx, t3x, t3y, r * 0.24);
    ctx.fill();

    // 4 Pairs of Spined Arachnid Legs
    for (let side = -1; side <= 1; side += 2) {
      for (let l = 0; l < 4; l++) {
        const offsetRatio = (l - 1.5) * 0.45;
        const stride = Math.sin(e.legPhase + l * 1.55 + (side === 1 ? 0 : Math.PI)) * (r * 0.28);

        const rootX = offsetRatio * r * 0.88;
        const rootY = side * r * 0.40;
        const kneeX = rootX + stride * 0.58 + (l < 2 ? r * 0.12 : -r * 0.12);
        const kneeY = side * (r * 1.16 + (l === 1 || l === 2 ? r * 0.16 : 0));
        const tipX  = kneeX + stride * 0.82 + (l < 2 ? r * 0.32 : -r * 0.28);
        const tipY  = side * (r * 1.66);

        ctx.strokeStyle = darkChitin;
        ctx.lineWidth = Math.max(2.6, r * 0.19);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        ctx.fillStyle = thornCol;
        ctx.beginPath();
        ctx.moveTo(kneeX - r * 0.08, kneeY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(kneeX + r * 0.11, kneeY - side * r * 0.08);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Dual Acid Injector Claws
    const pinch = Math.sin(e.legPhase * 1.15) * 0.20;
    const clawReach = r * 1.46;
    for (let side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(r * 0.44, side * r * 0.46);
      ctx.rotate(side * (0.32 - pinch));

      ctx.fillStyle = thornCol;
      ctx.strokeStyle = darkChitin;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(clawReach * 0.46, side * r * 0.38);
      ctx.lineTo(clawReach * 1.02, -side * r * 0.10);
      ctx.lineTo(clawReach * 0.70, -side * r * 0.04);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = toxicLime;
      ctx.beginPath();
      ctx.moveTo(clawReach * 0.64, side * r * 0.16);
      ctx.lineTo(clawReach * 1.02, -side * r * 0.10);
      ctx.lineTo(clawReach * 0.70, -side * r * 0.04);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Faceted Venom Sac Abdomen & Chambers
    ctx.fillStyle = darkChitin;
    ctx.strokeStyle = toxicLime;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(r * 0.05, -r * 0.58);
    ctx.lineTo(-r * 0.64, -r * 0.72);
    ctx.lineTo(-r * 1.12, 0);
    ctx.lineTo(-r * 0.64, r * 0.72);
    ctx.lineTo(r * 0.05, r * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spiked Thorax & Glowing Eyes
    ctx.fillStyle = fleshCol;
    ctx.strokeStyle = darkChitin;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(r * 1.04, 0);
    ctx.lineTo(r * 0.56, -r * 0.68);
    ctx.lineTo(-r * 0.24, -r * 0.62);
    ctx.lineTo(-r * 0.54, 0);
    ctx.lineTo(-r * 0.24, r * 0.62);
    ctx.lineTo(r * 0.56, r * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = brightAcid;
    ctx.beginPath();
    safeArc(ctx, r * 0.70, -r * 0.22, 2.2);
    safeArc(ctx, r * 0.70,  r * 0.22, 2.2);
    safeArc(ctx, r * 0.50, -r * 0.36, 1.8);
    safeArc(ctx, r * 0.50,  r * 0.36, 1.8);
    ctx.fill();
  }
  // =========================================================================
  // 5. ELITE XENO PRAETORIAN (ROYAL SUB-BOSS WARLORD)
  // =========================================================================
  else {
    const darkRoyal  = flash ? "#ffffff" : (isChilled ? "#0c4a6e" : "#24033d");
    const royalPlate = flash ? "#ffffff" : (isChilled ? "#0284c7" : "#7e22ce");
    const neonGreen  = flash ? "#ffffff" : (isChilled ? "#bae6fd" : "#4ade80");
    const plasmaPink = flash ? "#ffffff" : (isChilled ? "#7dd3fc" : "#e879f9");
    const boneBlade  = flash ? "#ffffff" : (isChilled ? "#f0f9ff" : "#f8fafc");

    // Twin Spiked Royal Halberd Tails
    for (let tSide = -1; tSide <= 1; tSide += 2) {
      const wag = Math.sin(e.legPhase * 0.90 + (tSide === 1 ? 0 : 1.5)) * (r * 0.38);
      const midX = -r * 1.32, midY = tSide * r * 0.46 + wag * 0.5;
      const endX = -r * 1.98, endY = tSide * r * 0.38 + wag;

      ctx.strokeStyle = darkRoyal;
      ctx.lineWidth = Math.max(3.6, r * 0.22);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r * 0.68, tSide * r * 0.22);
      ctx.lineTo(midX, midY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.strokeStyle = plasmaPink;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = neonGreen;
      ctx.beginPath();
      ctx.moveTo(endX + r * 0.16, endY - tSide * r * 0.12);
      ctx.lineTo(endX - r * 0.46, endY + tSide * r * 0.18);
      ctx.lineTo(endX - r * 0.14, endY - tSide * r * 0.26);
      ctx.closePath();
      ctx.fill();
    }

    // 4 Pairs of Heavy Armored Scythe Legs with Knee Spurs
    for (let side = -1; side <= 1; side += 2) {
      for (let l = 0; l < 4; l++) {
        const offsetRatio = (l - 1.5) * 0.45;
        const stride = Math.sin(e.legPhase + l * 1.5 + (side === 1 ? 0 : Math.PI)) * (r * 0.26);

        const rootX = offsetRatio * r * 0.92;
        const rootY = side * r * 0.46;
        const kneeX = rootX + stride * 0.58;
        const kneeY = side * (r * 1.18 + (l === 1 || l === 2 ? r * 0.16 : 0));
        const tipX  = kneeX + stride * 0.80 + (l < 2 ? r * 0.28 : -r * 0.26);
        const tipY  = side * (r * 1.66);

        ctx.strokeStyle = darkRoyal;
        ctx.lineWidth = Math.max(3.8, r * 0.20);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        ctx.fillStyle = boneBlade;
        ctx.beginPath();
        ctx.moveTo(kneeX - r * 0.09, kneeY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(kneeX + r * 0.12, kneeY - side * r * 0.09);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = neonGreen;
        ctx.beginPath();
        ctx.moveTo(kneeX - r * 0.09, kneeY);
        ctx.lineTo(kneeX + r * 0.08, kneeY + side * r * 0.30);
        ctx.lineTo(kneeX + r * 0.12, kneeY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Colossal Executioner Scythes + Swept Royal Horns
    const slash = Math.sin(e.legPhase * 1.15) * 0.20;
    const reach = r * 1.64;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = boneBlade;
      ctx.strokeStyle = darkRoyal;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(r * 0.16, side * r * 0.64);
      ctx.quadraticCurveTo(r * 0.72, side * r * 1.16, r * 1.24, side * r * 0.68);
      ctx.quadraticCurveTo(r * 0.68, side * r * 0.80, r * 0.32, side * r * 0.44);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(r * 0.48, side * r * 0.50);
      ctx.rotate(side * (0.28 - slash));

      ctx.fillStyle = darkRoyal;
      ctx.strokeStyle = neonGreen;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -side * r * 0.10);
      ctx.lineTo(reach * 0.46, side * r * 0.46);
      ctx.lineTo(reach, -side * r * 0.12);
      ctx.lineTo(reach * 0.72, -side * r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Praetorian Torso, Crest & Bio-Plasma Rail Cannons
    ctx.fillStyle = royalPlate;
    ctx.strokeStyle = neonGreen;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(r * 1.06, 0);
    ctx.lineTo(r * 0.60, -r * 0.74);
    ctx.lineTo(-r * 0.28, -r * 0.80);
    ctx.lineTo(-r * 0.64, 0);
    ctx.lineTo(-r * 0.28, r * 0.80);
    ctx.lineTo(r * 0.60, r * 0.74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let side = -1; side <= 1; side += 2) {
      const py = side * r * 0.74;
      ctx.fillStyle = darkRoyal;
      ctx.strokeStyle = neonGreen;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-r * 0.32, py - side * 4);
      ctx.lineTo(r * 0.68, py - side * 5);
      ctx.lineTo(r * 0.84, py - side * 1.5);
      ctx.lineTo(r * 0.56, py + side * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Glowing Eyes
    ctx.fillStyle = neonGreen;
    ctx.beginPath();
    safeArc(ctx, r * 0.78, -r * 0.22, 2.5);
    safeArc(ctx, r * 0.78,  r * 0.22, 2.5);
    ctx.fill();
  }

  ctx.restore();

  // Floating Overhead Health Bar (when damaged)
  if (e.hp < e.maxHp) {
    const barW = Math.max(26, r * 2.2);
    const barH = 3.5;
    const hpPct = Math.max(0, e.hp / e.maxHp);

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(e.x - barW / 2, e.y - r - 8, barW, barH);
    ctx.fillStyle = e.isElite ? "#c084fc" : "#ef4444";
    ctx.fillRect(e.x - barW / 2, e.y - r - 8, barW * hpPct, barH);
    ctx.restore();
  }
}


