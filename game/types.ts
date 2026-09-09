import { ShipId } from './ships';

export type GameStatus = 'start' | 'playing' | 'paused' | 'gameOver' | 'victory';

export type GameMode = 'solo' | 'coop';

export type PowerUpType =
  | 'health'
  | 'shield'
  | 'rapid'
  | 'invuln'
  | 'bomb'
  | 'weapon'
  | 'crystal';

export type WeaponTier = 1 | 2 | 3 | 4 | 5;

export type EnemyType =
  | 'basic'
  | 'fast'
  | 'heavy'
  | 'shooter'
  | 'stealth'
  | 'kamikaze'
  | 'shield'
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
  shipId: ShipId;
  shipName: string;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  weaponTier: number;
  isShielded: boolean;
  shieldTimeRemaining: number;
  isInvincible: boolean;
  invincibleTimeRemaining: number;
  isRapidFire: boolean;
  rapidFireTimeRemaining: number;
  bombs: number;
  powerShotProgress: number; // 0 to 1
  powerShotReady: boolean;
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

  // Single-player backward compatibility shortcuts
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
  selectedShipId: ShipId;
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
