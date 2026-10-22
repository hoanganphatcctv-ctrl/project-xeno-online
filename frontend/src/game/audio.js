/**
 * PROJECT XENO: AUDIO & SFX SYNTHESIZER ENGINE
 * Hybrid Web Audio API Synthesizer + High-Fidelity WAV Audio Buffer Loader
 * Fully autonomous: Functions 100% even without external audio files!
 */

export const SFX_MANIFEST = {
  pistol: "/audio/Wav/pistol_shot.wav",
  shotgun: "/audio/Wav/shotgun.wav",
  minigun: "/audio/Wav/machine_gun.wav",
  flamethrower: "/audio/Wav/flame_thrower.wav",
  plasma: "/audio/Wav/plasma_shot.wav",
  cryo: "/audio/Wav/magma_shot.wav",
  rocket: "/audio/Wav/rocket_launch.wav",
  grenade: "/audio/Wav/granade_luncher.wav",
  explosion: "/audio/Wav/explosion.wav",
  big_explosion: "/audio/Wav/big_explosion.WAV",
  null_click: "/audio/Wav/null.wav",
  shell_drop: "/audio/Wav/drop_shell.wav",
  shell_drop2: "/audio/Wav/drop_shell2.wav",
  shotgun_shell: "/audio/Wav/drop_shotgunshell.wav",
  monster_hit: "/audio/Wav/monster_hit.wav",
  monster_hit2: "/audio/Wav/monster_hit2.wav",
  monster_death: "/audio/Wav/monster_death.wav",
  monster_death2: "/audio/Wav/monster_death2.wav",
  monster_death4: "/audio/Wav/monster4_death.wav",
  monster_death5: "/audio/Wav/monster5_death.wav",
  armor_hit1: "/audio/Wav/armor_hit1.wav",
  armor_hit2: "/audio/Wav/armor_hit2.wav",
  broke_armor: "/audio/Wav/broke_armor.wav",
  male_death: "/audio/Wav/male_death.wav",
  female_death: "/audio/Wav/female_death.wav",
  footstep: "/audio/Wav/footsteps.wav",
  ammo_pickup: "/audio/Wav/ammo_pickup.wav",
  pick_armor: "/audio/Wav/pick_armor.wav",
  take_healh: "/audio/Wav/take_healh.wav",
  weapon_pickup: "/audio/Wav/weapon_pickup.wav",
  drop_item: "/audio/Wav/drop_item.wav",
  energy_on: "/audio/Wav/energy_on.wav",
  energy_off: "/audio/Wav/energy_off.wav",
  door: "/audio/Wav/big_door.wav",
  barrel: "/audio/Wav/barrel_death.wav",
  generator: "/audio/Wav/generator.wav",
  buy: "/audio/Wav/buy.wav",
  click: "/audio/Wav/mouse_click.wav",
  hover: "/audio/Wav/mouse_over.wav",
  error: "/audio/Wav/mouse_error.wav"
};

export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.muted = false;
    this.masterVol = 1.0;
    this.sfxVol = 1.0;
    this.bgmVol = 0.65;
    this.alertVol = 1.0;

    this.lastFlameTime = 0;
    this.lastLaserTime = 0;
    this.lastMonsterHitTime = 0;
    this.lastFootstepTime = 0;
    this.lastClickSoundTime = 0;

    this.currentBgm = null;
    this.bgmLobby = null;
    this.bgmIngame = null;
    this._initialized = false;
  }

  init() {
    if (this._initialized && this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
      }

      this.bgmLobby = new Audio("/audio/nhac_nen.ogg");
      this.bgmLobby.loop = true;
      this.bgmLobby.preload = "auto";
      this.bgmLobby.onerror = () => {
        if (this.bgmLobby && !this.bgmLobby.src.includes("nhacnen.ogg")) {
          this.bgmLobby.src = "/audio/nhacnen.ogg";
        }
      };

      this.bgmIngame = new Audio("/audio/ingame.mp3");
      this.bgmIngame.loop = true;
      this.bgmIngame.preload = "auto";

      this._initialized = true;
      this.preloadCommonBuffers();
    } catch (err) {
      console.warn("[SoundSystem] Init error:", err);
    }
  }

  getSfxGain(base = 1.0) {
    return Math.max(0.0001, base * this.masterVol * this.sfxVol);
  }

  getAlertGain(base = 1.0) {
    return Math.max(0.0001, base * this.masterVol * this.alertVol);
  }

  async loadBuffer(key, url) {
    this.init();
    if (!this.ctx || !url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers[key] = decoded;
      return decoded;
    } catch (err) {
      return null;
    }
  }

  preloadCommonBuffers() {
    const keysToLoad = [
      "pistol", "shotgun", "minigun", "flamethrower", "plasma", "cryo",
      "explosion", "monster_hit", "monster_death", "click", "ammo_pickup"
    ];
    keysToLoad.forEach(key => {
      if (SFX_MANIFEST[key]) {
        this.loadBuffer(key, SFX_MANIFEST[key]).catch(() => {});
      }
    });
  }

  playSample(key, vol = 1.0, pitchVariation = 0.0) {
    if (this.muted) return false;
    this.init();
    const buf = this.buffers[key];
    if (!buf || !this.ctx) return false;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buf;
      if (pitchVariation > 0) {
        source.playbackRate.value = Math.max(
          0.65,
          Math.min(1.4, 1.0 + (Math.random() * 2 - 1) * pitchVariation)
        );
      }
      const gain = this.ctx.createGain();
      gain.gain.value = this.getSfxGain(vol);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);
      return true;
    } catch (err) {
      return false;
    }
  }

  playShoot(type = "bullet", weaponId = 0) {
    if (this.muted) return;
    this.init();

    let played = false;
    if (weaponId === 1) { // Shotgun M1014
      played = this.playSample("shotgun", 0.75, 0.06);
      setTimeout(() => this.playSample("shotgun_shell", 0.45), 240);
    } else if (weaponId === 2) { // Minigun M134
      played = this.playSample("minigun", 0.65, 0.08);
      if (Math.random() < 0.4) setTimeout(() => this.playSample("shell_drop", 0.3), 160);
    } else if (weaponId === 3 || type === "flame") { // Flamethrower
      const now = performance.now();
      if (now - this.lastFlameTime < 75) return;
      this.lastFlameTime = now;
      played = this.playSample("flamethrower", 0.55, 0.08);
    } else if (weaponId === 4 || type === "cryo") { // M4-Cryo
      played = this.playSample("cryo", 0.75, 0.05);
    } else if (weaponId === 5 || type === "plasma") { // Gauss M82-G
      played = this.playSample("plasma", 0.85, 0.04);
    } else if (weaponId === 6 || type === "laser") { // Hyperion Laser
      const now = performance.now();
      if (now - this.lastLaserTime < 65) return;
      this.lastLaserTime = now;
      played = this.playSample("plasma", 0.45, 0.12);
    } else { // Pistol Song Lục MK23
      played = this.playSample("pistol", 0.7, 0.06);
      if (Math.random() < 0.45) setTimeout(() => this.playSample("shell_drop", 0.35), 180);
    }

    if (!played && this.ctx) {
      this.playSyntheticShoot(type);
    }
  }

  playSyntheticShoot(type) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (type === "flame") {
      this.playNoise(0.12, 520, 0.14);
      return;
    }

    if (type === "laser") {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(840, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);
      gain.gain.setValueAtTime(this.getSfxGain(0.14), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === "plasma") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
      gain.gain.setValueAtTime(this.getSfxGain(0.22), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    } else if (type === "cryo") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);
      gain.gain.setValueAtTime(this.getSfxGain(0.16), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
      gain.gain.setValueAtTime(this.getSfxGain(0.18), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      this.playNoise(0.05, 1300, 0.10);
    }

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playExplosion(isBig = false) {
    if (this.muted) return;
    this.init();
    const key = isBig ? "big_explosion" : "explosion";
    if (!this.playSample(key, 0.8, 0.08)) {
      this.playNoise(0.48, isBig ? 160 : 240, 0.44);
    }
  }

  playMonsterHit() {
    if (this.muted) return;
    this.init();
    const now = performance.now();
    if (now - this.lastMonsterHitTime < 55) return;
    this.lastMonsterHitTime = now;
    const key = Math.random() < 0.5 ? "monster_hit" : "monster_hit2";
    if (!this.playSample(key, 0.5, 0.12)) {
      this.playNoise(0.08, 420, 0.14);
    }
  }

  playMonsterDeath(isBoss = false) {
    if (this.muted) return;
    this.init();
    if (isBoss) {
      this.playSample("big_explosion", 0.95);
      this.playSample("monster_death2", 0.85);
      return;
    }
    const samples = ["monster_death", "monster_death2", "monster_death4", "monster_death5"];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    if (!this.playSample(pick, 0.6, 0.15)) {
      this.playNoise(0.15, 300, 0.2);
    }
  }

  playArmorHit() {
    if (this.muted) return;
    this.init();
    const key = Math.random() < 0.5 ? "armor_hit1" : "armor_hit2";
    this.playSample(key, 0.75, 0.05);
  }

  playRicochet() {
    if (this.muted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1650 + Math.random() * 550, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.065);
    gain.gain.setValueAtTime(this.getSfxGain(0.09), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playPickup(kind = "cash") {
    if (this.muted) return;
    this.init();
    let key = "drop_item";
    if (kind === "medkit") key = "take_healh";
    else if (kind === "armor") key = "pick_armor";
    else if (kind === "ammo") key = "ammo_pickup";
    else if (kind === "weapon") key = "weapon_pickup";

    if (!this.playSample(key, 0.85)) {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(this.getSfxGain(0.16), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    }
  }

  playClick() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastClickSoundTime < 40) return;
    this.lastClickSoundTime = now;
    this.init();
    if (!this.playSample("click", 0.5)) {
      if (this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.getSfxGain(0.08), this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
      }
    }
  }

  playHover() {
    if (this.muted) return;
    this.init();
    this.playSample("hover", 0.25);
  }

  playDoorSlide(open = true) {
    if (this.muted) return;
    this.init();
    if (!this.playSample("door", 0.65)) {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(open ? 110 : 160, now);
        osc.frequency.exponentialRampToValueAtTime(open ? 170 : 80, now + 0.35);
        gain.gain.setValueAtTime(this.getSfxGain(0.12), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    }
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.playSample("error", 0.75)) {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(105, now + 0.08);
        gain.gain.setValueAtTime(this.getSfxGain(0.15), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    }
  }

  playBuy() {
    if (this.muted) return;
    this.init();
    if (!this.playSample("buy", 0.85)) {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(this.getSfxGain(0.2), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    }
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (this.ctx) {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        const startTime = now + idx * 0.12;
        const duration = idx === 3 ? 0.6 : 0.15;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(this.getSfxGain(0.22), startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    }
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (this.ctx) {
      const now = this.ctx.currentTime;
      const notes = [392.00, 369.99, 329.63, 261.63]; // G4, F#4, E4, C4 descending
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        const startTime = now + idx * 0.18;
        const duration = idx === 3 ? 0.7 : 0.2;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(this.getSfxGain(0.2), startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    }
  }

  playNoise(duration, filterFreq, vol) {
    if (this.muted || !this.ctx) return;
    try {
      const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFreq;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.getSfxGain(vol), this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.008, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playBgm(track = "lobby") {
    this.currentBgm = track;
    if (this.muted) {
      this.stopBgm();
      return;
    }
    this.init();
    const lobbyVol = Math.max(0, Math.min(1, this.masterVol * this.bgmVol));
    const ingameVol = Math.max(0, Math.min(1, this.masterVol * this.bgmVol * 0.85));

    if (track === "lobby") {
      if (this.bgmIngame) {
        this.bgmIngame.pause();
        this.bgmIngame.currentTime = 0;
      }
      if (this.bgmLobby) {
        this.bgmLobby.volume = lobbyVol;
        this.bgmLobby.play().catch(() => {});
      }
    } else if (track === "ingame") {
      if (this.bgmLobby) {
        this.bgmLobby.pause();
        this.bgmLobby.currentTime = 0;
      }
      if (this.bgmIngame) {
        this.bgmIngame.volume = ingameVol;
        this.bgmIngame.play().catch(() => {});
      }
    }
  }

  stopBgm() {
    try {
      if (this.bgmLobby) this.bgmLobby.pause();
      if (this.bgmIngame) this.bgmIngame.pause();
    } catch (e) {}
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else if (this.currentBgm) {
      this.playBgm(this.currentBgm);
    }
    return this.muted;
  }
}

export const sfx = new SoundSystem();
export default sfx;

