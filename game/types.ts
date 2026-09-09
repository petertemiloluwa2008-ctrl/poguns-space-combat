export type GameStatus = 'start' | 'playing' | 'paused' | 'gameOver' | 'victory';

export type GameMode = 'solo' | 'coop';

export type PowerUpType = 'health' | 'ammo' | 'weapon' | 'shield' | 'crystal';

export type WeaponTier = 1 | 2 | 3 | 4 | 5;

export type EnemyType =
  | 'basic'
  | 'fast'
  | 'heavy'
  | 'shooter'
  | 'stealth'
  | 'kamikaze'
  | 'elite'
  | 'boss';

export type BossPhase = 1 | 2 | 3;

export interface BossState {
  active: boolean;
  name: string;
  health: number;
  maxHealth: number;
  phase: BossPhase;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  weaponTier: number;
  isShielded: boolean;
  shieldTimeRemaining: number;
  isAlive: boolean;
  kills: number;
}

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  score: number;
  highScore: number;
  playerLevel: number;
  playerXp: number;
  xpToNextLevel: number;
  stage: number;
  maxStages: number;
  stageName: string;
  comboMultiplier: number;
  p1: PlayerStats;
  p2?: PlayerStats;
  boss?: BossState | null;

  // Backward compatibility fields for single-player access
  playerHealth: number;
  playerMaxHealth: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  level: number;
}

export interface PilotProfile {
  id: string;
  callsign: string;
  rank: string;
  xp: number;
  level: number;
  totalScore: number;
  highScore: number;
  totalKills: number;
  bossesDefeated: number;
  stagesCleared: number;
  shipColor: string;
  achievements: string[];
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}
