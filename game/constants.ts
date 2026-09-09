export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Poguns Brand & Neon Palette
export const BRAND_PINK = '#FF1493';
export const BRIGHT_PINK = '#FF69C9';
export const SPACE_BG = '#050510';
export const DEEP_PURPLE = '#7C3AED';
export const DANGER_RED = '#FF3B5C';
export const NEON_WHITE = '#FFFFFF';
export const NEON_CYAN = '#00F0FF';
export const NEON_AMBER = '#FFB800';
export const NEON_GREEN = '#10B981';
export const NEON_LIME = '#39FF14';
export const GOLD_ACCENT = '#FFD700';

// Player Configuration
export const PLAYER_SPEED = 5.5;
export const PLAYER_HEALTH = 100;
export const PLAYER_WIDTH = 44;
export const PLAYER_HEIGHT = 52;
export const BASE_FIRE_COOLDOWN = 175; // ms
export const PROJECTILE_DAMAGE = 25;
export const MAGAZINE_CAPACITY = 30;
export const INITIAL_RESERVE_AMMO = 120;
export const RELOAD_DURATION = 1000; // ms
export const INVULNERABILITY_DURATION = 800; // ms

// Health Regeneration
export const REGEN_DELAY_MS = 4500; // 4.5 seconds after last damage
export const REGEN_HP_PER_SEC = 3.5;

// Projectile Configuration
export const PROJECTILE_SPEED = 12.5;
export const PROJECTILE_WIDTH = 6;
export const PROJECTILE_HEIGHT = 18;
export const ENEMY_PROJECTILE_SPEED = 5.5;
export const ENEMY_PROJECTILE_SIZE = 9;

// Power-Up Configurations
export const POWERUP_SPEED = 1.4;
export const POWERUP_SIZE = 26;
export const POWERUP_LIFETIME = 12000; // ms before despawn
export const DROP_CHANCE = 0.28; // 28% drop rate on enemy kill
export const SHIELD_DURATION_MS = 8000; // 8 seconds of plasma shield
export const OVERDRIVE_DURATION_MS = 10000; // 10 seconds of max tier multi-shot

// Enemy Configurations
export interface EnemyConfig {
  health: number;
  speed: number;
  score: number;
  damage: number;
  width: number;
  height: number;
  color: string;
  glowColor: string;
  shootCooldown?: number;
}

export const ENEMY_CONFIGS = {
  basic: {
    health: 45,
    speed: 2.2,
    score: 100,
    damage: 20,
    width: 42,
    height: 42,
    color: '#7C3AED',
    glowColor: '#9D4EDD',
  },
  fast: {
    health: 30,
    speed: 4.2,
    score: 200,
    damage: 15,
    width: 34,
    height: 34,
    color: '#00F0FF',
    glowColor: '#48CAE4',
  },
  heavy: {
    health: 180,
    speed: 1.2,
    score: 500,
    damage: 35,
    width: 66,
    height: 66,
    color: '#FF6B35',
    glowColor: '#F77F00',
  },
  shooter: {
    health: 80,
    speed: 1.8,
    score: 300,
    damage: 20,
    width: 48,
    height: 48,
    color: '#E01E37',
    glowColor: '#FF3B5C',
    shootCooldown: 1600,
  },
  stealth: {
    health: 65,
    speed: 2.6,
    score: 400,
    damage: 25,
    width: 44,
    height: 44,
    color: '#8338EC',
    glowColor: '#3A86FF',
    shootCooldown: 2000,
  },
  kamikaze: {
    health: 35,
    speed: 5.2,
    score: 250,
    damage: 30,
    width: 30,
    height: 30,
    color: '#FF0054',
    glowColor: '#FF5400',
  },
  elite: {
    health: 260,
    speed: 1.6,
    score: 800,
    damage: 30,
    width: 68,
    height: 60,
    color: '#FF007F',
    glowColor: '#FF69C9',
    shootCooldown: 1300,
  },
  boss: {
    health: 2200,
    speed: 1.1,
    score: 6000,
    damage: 40,
    width: 140,
    height: 105,
    color: '#4A0E4E',
    glowColor: '#FF1493',
    shootCooldown: 900,
  },
};

// Stage Configurations
export interface StageData {
  stageNumber: number;
  name: string;
  subtitle: string;
  scoreTarget: number;
  allowedEnemies: (keyof typeof ENEMY_CONFIGS)[];
  spawnInterval: number;
  speedMultiplier: number;
  isBossStage: boolean;
}

export const STAGES: StageData[] = [
  {
    stageNumber: 1,
    name: 'NEON OUTSKIRTS',
    subtitle: 'Sector Alpha — Vanguard Infiltration',
    scoreTarget: 1500,
    allowedEnemies: ['basic', 'fast'],
    spawnInterval: 1200,
    speedMultiplier: 1.0,
    isBossStage: false,
  },
  {
    stageNumber: 2,
    name: 'ASTEROID CORRIDOR',
    subtitle: 'Sector Beta — Hostile Interceptors',
    scoreTarget: 3800,
    allowedEnemies: ['basic', 'fast', 'shooter'],
    spawnInterval: 1000,
    speedMultiplier: 1.15,
    isBossStage: false,
  },
  {
    stageNumber: 3,
    name: 'CYBER NEBULA',
    subtitle: 'Sector Gamma — Armored Siege Fleet',
    scoreTarget: 7000,
    allowedEnemies: ['fast', 'shooter', 'heavy', 'stealth'],
    spawnInterval: 850,
    speedMultiplier: 1.3,
    isBossStage: false,
  },
  {
    stageNumber: 4,
    name: 'COMMAND FLEET ARMADA',
    subtitle: 'Sector Delta — Elite Assault Swarm',
    scoreTarget: 11500,
    allowedEnemies: ['shooter', 'heavy', 'stealth', 'kamikaze', 'elite'],
    spawnInterval: 700,
    speedMultiplier: 1.45,
    isBossStage: false,
  },
  {
    stageNumber: 5,
    name: 'POGUNS MATRIX CORE',
    subtitle: 'FINAL SECTOR — Dreadnought Prime Matrix',
    scoreTarget: 20000,
    allowedEnemies: ['fast', 'stealth', 'kamikaze', 'elite'],
    spawnInterval: 950,
    speedMultiplier: 1.55,
    isBossStage: true,
  },
];

// Profile Ranks
export const PILOT_RANKS = [
  { rank: 'CADET', minXp: 0, color: '#A0AEC0' },
  { rank: 'VANGUARD', minXp: 1500, color: '#00F0FF' },
  { rank: 'ACE PILOT', minXp: 4500, color: '#FFB800' },
  { rank: 'COMMANDER', minXp: 9500, color: '#10B981' },
  { rank: 'POGUNS LEGEND', minXp: 18000, color: '#FF1493' },
];
