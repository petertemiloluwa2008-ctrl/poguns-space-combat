import { AudioEvent, SoundEffectName, MusicTrackName } from './audioEvents';
import { AUDIO_SETTINGS } from './audioConfig';

export class AudioManager {
  private static instance: AudioManager | null = null;

  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;

  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private lastPlayedTime: Map<string, number> = new Map();

  private currentMusicSource: AudioBufferSourceNode | null = null;
  private currentMusicElement: HTMLAudioElement | null = null;
  private synthMusicInterval: number | null = null;
  private currentTrack: MusicTrackName | null = null;

  private isMutedState = false;
  private masterVolume = AUDIO_SETTINGS.MASTER_VOLUME;
  private initialized = false;
  private isPaused = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initAudioContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public initAudioContext() {
    if (this.initialized && this.audioCtx?.state === 'running') return;

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();

        // Master Gain
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.isMutedState ? 0 : this.masterVolume,
          this.audioCtx.currentTime
        );
        this.masterGain.connect(this.audioCtx.destination);

        // SFX Gain
        this.sfxGain = this.audioCtx.createGain();
        this.sfxGain.connect(this.masterGain);

        // Music Lowpass Filter
        this.musicFilter = this.audioCtx.createBiquadFilter();
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.setValueAtTime(20000, this.audioCtx.currentTime);

        // Music Gain
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.connect(this.musicFilter);
        this.musicFilter.connect(this.masterGain);
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.initialized = true;
    } catch (err) {
      console.warn('AudioManager: Web Audio API init error:', err);
    }
  }

  public playEvent(event: AudioEvent) {
    this.initAudioContext();

    switch (event) {
      case AudioEvent.UI_HOVER:
        this.playSynthHover();
        break;
      case AudioEvent.UI_CLICK:
        this.playSynthClick();
        break;
      case AudioEvent.PLAY_CLICK:
        this.playSynthPlayPunch();
        break;
      case AudioEvent.PLAYER_SHOT:
        this.playSynthLaser(880, 220, 0.09, 'sawtooth');
        break;
      case AudioEvent.MULTI_SHOT:
        this.playSynthMultiShot();
        break;
      case AudioEvent.AMMO_EMPTY:
        this.playSynthClick(320, 0.04);
        break;
      case AudioEvent.RELOAD_STARTED:
        this.playSynthReload();
        break;
      case AudioEvent.BULLET_WALL_IMPACT:
        this.playSynthLaser(400, 120, 0.05, 'square');
        break;
      case AudioEvent.BULLET_ENEMY_IMPACT:
        this.playSynthHit();
        break;
      case AudioEvent.PLAYER_HURT:
        this.playSynthExplosion(0.25);
        break;
      case AudioEvent.LOW_HEALTH:
        this.playSynthAlarm();
        break;
      case AudioEvent.SCORE_AWARDED:
        this.playSynthScoreDing();
        break;
      case AudioEvent.POWERUP_PICKUP:
        this.playSynthPowerup();
        break;
      case AudioEvent.SHIELD_ACTIVATE:
        this.playSynthShield();
        break;
      case AudioEvent.LEVEL_UP:
        this.playSynthLevelUp();
        break;
      case AudioEvent.STAGE_CLEAR:
        this.playSynthStageClear();
        break;
      case AudioEvent.BOSS_WARNING:
        this.playSynthBossAlert();
        break;
      case AudioEvent.VICTORY:
        this.playMusic('victory-theme');
        break;
      case AudioEvent.GAME_PAUSED:
        this.pauseGameplayAudio();
        break;
      case AudioEvent.GAME_RESUMED:
        this.resumeGameplayAudio();
        break;
      case AudioEvent.GAME_OVER:
        this.playMusic('defeat-theme');
        break;
    }
  }

  // --- Procedural Synth SFX ---

  private playSynthLaser(freqStart = 880, freqEnd = 220, duration = 0.09, type: OscillatorType = 'sawtooth') {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  private playSynthMultiShot() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    [1050, 1320].forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.02);
      osc.frequency.exponentialRampToValueAtTime(300, t + i * 0.02 + 0.1);
      gain.gain.setValueAtTime(0.22, t + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.02 + 0.1);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.02);
      osc.stop(t + i * 0.02 + 0.1);
    });
  }

  private playSynthHit() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  private playSynthExplosion(duration = 0.3) {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + duration);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  private playSynthPowerup() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.audioCtx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.28, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.12);
    });
  }

  private playSynthShield() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.22);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  private playSynthLevelUp() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const notes = [440, 554.37, 659.25, 880];
    const t = this.audioCtx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.35, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.18);
    });
  }

  private playSynthStageClear() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const notes = [587.33, 739.99, 880, 1174.66];
    const t = this.audioCtx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.09);
      gain.gain.setValueAtTime(0.3, t + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.25);
    });
  }

  private playSynthBossAlert() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t + i * 0.16);
      osc.frequency.setValueAtTime(160, t + i * 0.16 + 0.08);
      gain.gain.setValueAtTime(0.4, t + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.16 + 0.14);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.16);
      osc.stop(t + i * 0.16 + 0.14);
    }
  }

  private playSynthScoreDing() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.5, t); // E6
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private playSynthClick(freq = 440, duration = 0.03) {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  private playSynthHover() {
    this.playSynthClick(580, 0.025);
  }

  private playSynthPlayPunch() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.2);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  private playSynthReload() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    [320, 480, 640].forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.22, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.09);
    });
  }

  private playSynthAlarm() {
    if (this.isMutedState || !this.audioCtx || !this.sfxGain) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(600, t + 0.08);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // --- Dynamic Synth BGM Generation ---

  public playMusic(trackName: MusicTrackName) {
    this.initAudioContext();

    if (this.currentTrack === trackName) return;

    this.stopMusic();
    this.currentTrack = trackName;
    this.isPaused = false;

    // Start Procedural Synth BGM loop
    this.startSynthMusic(trackName);
  }

  private startSynthMusic(trackName: MusicTrackName) {
    if (this.isMutedState || !this.audioCtx || !this.musicGain) return;

    let step = 0;
    const bassScale =
      trackName === 'boss-theme'
        ? [55, 55, 65.41, 55, 73.42, 65.41, 55, 82.41] // Aggressive dark synth
        : trackName === 'victory-theme'
        ? [130.81, 164.81, 196.0, 261.63, 196.0, 261.63, 329.63, 392.0]
        : trackName === 'defeat-theme'
        ? [110, 98, 87.31, 73.42]
        : [110, 110, 130.81, 110, 146.83, 130.81, 110, 164.81]; // Pink arcade techno

    const tempo = trackName === 'boss-theme' ? 140 : trackName === 'victory-theme' ? 220 : 175;

    this.synthMusicInterval = window.setInterval(() => {
      if (this.isMutedState || !this.audioCtx || !this.musicGain || this.isPaused) return;

      const t = this.audioCtx.currentTime;
      const freq = bassScale[step % bassScale.length];
      step++;

      // Synth Bass Pulse
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = trackName === 'boss-theme' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const vol = (trackName === 'boss-theme' ? 0.22 : 0.16) * this.masterVolume;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.18);

      // Lead Melody Accent every 4 steps
      if (step % 4 === 0) {
        const leadOsc = this.audioCtx.createOscillator();
        const leadGain = this.audioCtx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(freq * 4, t);
        leadGain.gain.setValueAtTime(0.08 * this.masterVolume, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.25);
      }
    }, tempo);
  }

  public stopMusic() {
    if (this.synthMusicInterval !== null) {
      clearInterval(this.synthMusicInterval);
      this.synthMusicInterval = null;
    }

    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
        this.currentMusicSource.disconnect();
      } catch {}
      this.currentMusicSource = null;
    }

    if (this.currentMusicElement) {
      try {
        this.currentMusicElement.pause();
        this.currentMusicElement.currentTime = 0;
      } catch {}
      this.currentMusicElement = null;
    }

    this.currentTrack = null;
  }

  public pauseGameplayAudio() {
    this.isPaused = true;
    if (this.audioCtx && this.musicFilter && this.musicGain) {
      this.musicFilter.frequency.setTargetAtTime(450, this.audioCtx.currentTime, 0.1);
      this.musicGain.gain.setTargetAtTime(0.05, this.audioCtx.currentTime, 0.1);
    }
  }

  public resumeGameplayAudio() {
    this.isPaused = false;
    if (this.audioCtx && this.musicFilter && this.musicGain) {
      this.musicFilter.frequency.setTargetAtTime(20000, this.audioCtx.currentTime, 0.1);
      this.musicGain.gain.setTargetAtTime(0.5, this.audioCtx.currentTime, 0.1);
    }
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMutedState);
  }

  public setMuted(muted: boolean): boolean {
    this.isMutedState = muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.audioCtx.currentTime);
    }
    return this.isMutedState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx && !this.isMutedState) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }
}
