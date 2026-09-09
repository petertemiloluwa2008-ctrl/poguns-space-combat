import { SoundEffectName, MusicTrackName } from './audioEvents';

export interface SoundConfig {
  path: string;
  volume: number;
  minIntervalMs?: number;
}

export const SFX_CONFIG: Record<SoundEffectName, SoundConfig> = {
  'ui-hover': {
    path: '/audio/sfx/ui-hover.wav',
    volume: 0.35,
    minIntervalMs: 60,
  },
  'ui-click': {
    path: '/audio/sfx/ui-click.wav',
    volume: 0.5,
    minIntervalMs: 50,
  },
  'play-punch': {
    path: '/audio/sfx/play-punch.wav',
    volume: 0.85,
    minIntervalMs: 300,
  },
  'weapon-fire': {
    path: '/audio/sfx/weapon-fire.wav',
    volume: 0.45,
    minIntervalMs: 80,
  },
  'multi-shot': {
    path: '/audio/sfx/weapon-fire.wav',
    volume: 0.55,
    minIntervalMs: 80,
  },
  'empty-ammo': {
    path: '/audio/sfx/empty-ammo.wav',
    volume: 0.6,
    minIntervalMs: 120,
  },
  'reload': {
    path: '/audio/sfx/reload.wav',
    volume: 0.7,
    minIntervalMs: 800,
  },
  'bullet-wall-impact': {
    path: '/audio/sfx/bullet-wall-impact.wav',
    volume: 0.3,
    minIntervalMs: 70,
  },
  'bullet-enemy-impact': {
    path: '/audio/sfx/bullet-enemy-impact.wav',
    volume: 0.55,
    minIntervalMs: 60,
  },
  'score-ding': {
    path: '/audio/sfx/score-ding.wav',
    volume: 0.5,
    minIntervalMs: 90,
  },
  'persona-hurt': {
    path: '/audio/sfx/persona-hurt.wav',
    volume: 0.75,
    minIntervalMs: 250,
  },
  'low-health-warning': {
    path: '/audio/sfx/low-health-warning.wav',
    volume: 0.6,
    minIntervalMs: 700,
  },
  'powerup-pickup': {
    path: '/audio/sfx/score-ding.wav',
    volume: 0.6,
    minIntervalMs: 100,
  },
  'shield-activate': {
    path: '/audio/sfx/play-punch.wav',
    volume: 0.6,
    minIntervalMs: 200,
  },
  'level-up': {
    path: '/audio/sfx/play-punch.wav',
    volume: 0.7,
    minIntervalMs: 300,
  },
  'stage-clear': {
    path: '/audio/sfx/play-punch.wav',
    volume: 0.75,
    minIntervalMs: 500,
  },
  'boss-warning': {
    path: '/audio/sfx/low-health-warning.wav',
    volume: 0.8,
    minIntervalMs: 600,
  },
  'victory-fanfare': {
    path: '/audio/sfx/play-punch.wav',
    volume: 0.85,
    minIntervalMs: 500,
  },
};

export const MUSIC_CONFIG: Record<MusicTrackName, { path: string; volume: number; loop: boolean }> = {
  'menu-theme': {
    path: '/audio/music/menu-theme.wav',
    volume: 0.5,
    loop: true,
  },
  'gameplay-theme': {
    path: '/audio/music/gameplay-theme.wav',
    volume: 0.45,
    loop: true,
  },
  'boss-theme': {
    path: '/audio/music/gameplay-theme.wav',
    volume: 0.55,
    loop: true,
  },
  'victory-theme': {
    path: '/audio/music/menu-theme.wav',
    volume: 0.6,
    loop: false,
  },
  'defeat-theme': {
    path: '/audio/music/defeat-theme.wav',
    volume: 0.6,
    loop: false,
  },
};

export const AUDIO_SETTINGS = {
  MASTER_VOLUME: 0.8,
  PAUSED_BGM_VOLUME_RATIO: 0.25,
  PAUSED_FILTER_FREQ: 450,
  LOW_HEALTH_THRESHOLD: 0.2,
};
