import { BRAND_PINK, NEON_CYAN, NEON_WHITE, GOLD_ACCENT, DANGER_RED } from './constants';

export type ShipId = 'vanguard' | 'phantom' | 'titan' | 'spectre';

export interface ShipConfig {
  id: ShipId;
  name: string;
  tagline: string;
  description: string;
  health: number;
  maxHealth: number;
  speed: number;
  baseFireCooldown: number; // ms between auto-shots
  armorReduction: number; // percentage damage reduction (0 to 0.5)
  powerShotCooldown: number; // ms to recharge power shot
  powerShotDamage: number;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  specialAbility: string;
  stats: {
    speed: number; // 1-10
    armor: number; // 1-10
    firepower: number; // 1-10
    durability: number; // 1-10
  };
}

export const SHIPS: Record<ShipId, ShipConfig> = {
  vanguard: {
    id: 'vanguard',
    name: 'VANGUARD STRIKE',
    tagline: 'Balanced Tactical Fighter',
    description: 'The standard Poguns fleet interceptor. Excellent balance of firepower, speed, and defense.',
    health: 100,
    maxHealth: 100,
    speed: 5.6,
    baseFireCooldown: 160,
    armorReduction: 0.0,
    powerShotCooldown: 9000,
    powerShotDamage: 180,
    primaryColor: BRAND_PINK,
    accentColor: NEON_CYAN,
    glowColor: '#FF1493',
    specialAbility: 'Plasma Nova Beam: Pierces through all enemies in its line of fire.',
    stats: {
      speed: 7,
      armor: 6,
      firepower: 7,
      durability: 7,
    },
  },
  phantom: {
    id: 'phantom',
    name: 'PHANTOM INTERCEPTOR',
    tagline: 'High-Velocity Scout',
    description: 'Lightweight titanium chassis engineered for extreme agility and lightning-fast auto-firing.',
    health: 75,
    maxHealth: 75,
    speed: 7.2,
    baseFireCooldown: 110,
    armorReduction: -0.1, // takes 10% more damage if hit
    powerShotCooldown: 7500,
    powerShotDamage: 140,
    primaryColor: NEON_CYAN,
    accentColor: '#3A86FF',
    glowColor: '#00F0FF',
    specialAbility: 'Hyper-Pulse Laser: Ultra-fast automatic fire rate and nimble evasive speed.',
    stats: {
      speed: 10,
      armor: 4,
      firepower: 9,
      durability: 5,
    },
  },
  titan: {
    id: 'titan',
    name: 'TITAN DREADNOUGHT',
    tagline: 'Heavy Armored Fortress',
    description: 'Massive armored hull with built-in kinetic plating that absorbs heavy incoming enemy fire.',
    health: 160,
    maxHealth: 160,
    speed: 4.2,
    baseFireCooldown: 210,
    armorReduction: 0.25, // 25% damage reduction
    powerShotCooldown: 11000,
    powerShotDamage: 260,
    primaryColor: '#FF5400',
    accentColor: DANGER_RED,
    glowColor: '#FF6B35',
    specialAbility: 'Siege Armor Plating: Built-in 25% damage reduction and devastating Power Shot.',
    stats: {
      speed: 4,
      armor: 10,
      firepower: 9,
      durability: 10,
    },
  },
  spectre: {
    id: 'spectre',
    name: 'SPECTRE WARP-CRUISER',
    tagline: 'Advanced Energy Platform',
    description: 'Experimental starship channeling raw electromagnetic energy for rapid power shots and homing bursts.',
    health: 90,
    maxHealth: 90,
    speed: 6.0,
    baseFireCooldown: 140,
    armorReduction: 0.05,
    powerShotCooldown: 6000,
    powerShotDamage: 220,
    primaryColor: '#9D4EDD',
    accentColor: GOLD_ACCENT,
    glowColor: '#C77DFF',
    specialAbility: 'Overload Core: Rapid-recharge Power Shot and wide energy spread.',
    stats: {
      speed: 8,
      armor: 5,
      firepower: 10,
      durability: 6,
    },
  },
};
