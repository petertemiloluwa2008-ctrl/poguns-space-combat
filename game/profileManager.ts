import { PilotProfile } from './types';
import { PILOT_RANKS, BRAND_PINK } from './constants';

const PROFILES_STORAGE_KEY = 'poguns_pilot_profiles';
const ACTIVE_PROFILE_KEY = 'poguns_active_profile_id';

const DEFAULT_PROFILE: PilotProfile = {
  id: 'pilot-default',
  callsign: 'VANGUARD-01',
  rank: 'CADET',
  xp: 0,
  level: 1,
  totalScore: 0,
  highScore: 0,
  totalKills: 0,
  bossesDefeated: 0,
  stagesCleared: 0,
  shipColor: BRAND_PINK,
  selectedShipId: 'vanguard',
  achievements: [],
};

export class ProfileManager {
  private static instance: ProfileManager | null = null;
  private profiles: PilotProfile[] = [{ ...DEFAULT_PROFILE }];
  private activeProfileId: string = 'pilot-default';

  private constructor() {
    this.loadProfiles();
  }

  public static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  private loadProfiles() {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.profiles = parsed;
        }
      }

      const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (activeId && this.profiles.some((p) => p.id === activeId)) {
        this.activeProfileId = activeId;
      }
    } catch {
      // Fallback
    }

    if (this.profiles.length === 0) {
      this.profiles = [{ ...DEFAULT_PROFILE }];
      this.activeProfileId = DEFAULT_PROFILE.id;
      this.saveProfiles();
    }
  }

  public saveProfiles() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(this.profiles));
      localStorage.setItem(ACTIVE_PROFILE_KEY, this.activeProfileId);
    } catch {}
  }

  public getProfiles(): PilotProfile[] {
    return [...this.profiles];
  }

  public getActiveProfile(): PilotProfile {
    const found = this.profiles.find((p) => p.id === this.activeProfileId);
    return found || this.profiles[0] || { ...DEFAULT_PROFILE };
  }

  public setActiveProfile(id: string) {
    if (this.profiles.some((p) => p.id === id)) {
      this.activeProfileId = id;
      this.saveProfiles();
    }
  }

  public createProfile(callsign: string, shipColor = BRAND_PINK): PilotProfile {
    const newProfile: PilotProfile = {
      id: 'pilot-' + Date.now(),
      callsign: callsign.trim().toUpperCase() || 'PILOT-' + Math.floor(Math.random() * 900 + 100),
      rank: 'CADET',
      xp: 0,
      level: 1,
      totalScore: 0,
      highScore: 0,
      totalKills: 0,
      bossesDefeated: 0,
      stagesCleared: 0,
      shipColor,
      selectedShipId: 'vanguard',
      achievements: [],
    };
    this.profiles.push(newProfile);
    this.activeProfileId = newProfile.id;
    this.saveProfiles();
    return newProfile;
  }

  public updateActiveCallsign(callsign: string) {
    const p = this.getActiveProfile();
    p.callsign = callsign.trim().toUpperCase() || p.callsign;
    this.saveProfiles();
  }

  public updateActiveShipColor(color: string) {
    const p = this.getActiveProfile();
    p.shipColor = color;
    this.saveProfiles();
  }

  public updateActiveShip(shipId: any) {
    const p = this.getActiveProfile();
    p.selectedShipId = shipId;
    this.saveProfiles();
  }

  public updateProfile(updates: Partial<PilotProfile>) {
    const p = this.getActiveProfile();
    Object.assign(p, updates);
    this.saveProfiles();
  }

  public addMatchStats(stats: {
    score: number;
    kills: number;
    stageReached: number;
    bossDefeated: boolean;
  }) {
    const p = this.getActiveProfile();
    p.totalScore += stats.score;
    p.totalKills += stats.kills;
    if (stats.score > p.highScore) {
      p.highScore = stats.score;
    }
    if (stats.bossDefeated) {
      p.bossesDefeated += 1;
    }
    if (stats.stageReached > p.stagesCleared) {
      p.stagesCleared = stats.stageReached;
    }

    const earnedXp =
      Math.floor(stats.score / 10) +
      stats.kills * 50 +
      (stats.bossDefeated ? 1000 : 0);
    p.xp += earnedXp;

    p.level = Math.max(1, Math.floor(Math.sqrt(p.xp / 120)) + 1);

    for (let i = PILOT_RANKS.length - 1; i >= 0; i--) {
      if (p.xp >= PILOT_RANKS[i].minXp) {
        p.rank = PILOT_RANKS[i].rank;
        break;
      }
    }

    this.saveProfiles();
  }
}
