import {
  PLAYER_SPEED,
  PLAYER_HEALTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  BASE_FIRE_COOLDOWN,
  MAGAZINE_CAPACITY,
  INITIAL_RESERVE_AMMO,
  RELOAD_DURATION,
  INVULNERABILITY_DURATION,
  REGEN_DELAY_MS,
  REGEN_HP_PER_SEC,
  BRAND_PINK,
  NEON_WHITE,
  NEON_CYAN,
  NEON_GREEN,
  SHIELD_DURATION_MS,
  OVERDRIVE_DURATION_MS,
  PROJECTILE_DAMAGE,
} from './constants';
import { Projectile } from './projectiles';
import { InputState } from './input';
import { Particle } from './particles';
import { AudioManager } from './audio/AudioManager';
import { AudioEvent } from './audio/audioEvents';
import { WeaponTier } from './types';

export class Player {
  public id: 'p1' | 'p2';
  public x: number;
  public y: number;
  public width = PLAYER_WIDTH;
  public height = PLAYER_HEIGHT;
  public speed = PLAYER_SPEED;

  public health = PLAYER_HEALTH;
  public maxHealth = PLAYER_HEALTH;
  public kills = 0;

  // Primary Theme Color
  public primaryColor = BRAND_PINK;
  public accentColor = NEON_CYAN;

  // Weapon Systems & Multi-Shot
  public weaponTier: WeaponTier = 1;
  public overdriveTimer = 0;

  // Ammo & Reloading
  public ammo = MAGAZINE_CAPACITY;
  public maxAmmo = MAGAZINE_CAPACITY;
  public reserveAmmo = INITIAL_RESERVE_AMMO;
  public isReloading = false;
  public reloadProgress = 0;
  private reloadTimer = 0;

  // Shooting & Timing
  public lastFireTime = 0;
  private lastEmptyClickTime = 0;

  // Invulnerability & Shield
  public invulnerableTimer = 0;
  public shieldTimer = 0;

  // Health Regeneration
  public timeSinceLastDamage = 0;
  private regenSparkTimer = 0;

  // Low Health Audio
  private lowHealthAlertTimer = 0;

  // Engine Particle Accumulator
  private thrusterTimer = 0;

  constructor(
    x: number,
    y: number,
    id: 'p1' | 'p2' = 'p1',
    primaryColor = BRAND_PINK,
    accentColor = NEON_CYAN
  ) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.primaryColor = primaryColor;
    this.accentColor = accentColor;
  }

  update(
    dt: number,
    input: InputState,
    boundsWidth: number,
    boundsHeight: number,
    particles: Particle[]
  ) {
    // 1. Movement logic
    let dx = 0;
    let dy = 0;

    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.x += dx * this.speed;
    this.y += dy * this.speed;

    // Arena boundary limits
    this.x = Math.max(10, Math.min(boundsWidth - this.width - 10, this.x));
    this.y = Math.max(10, Math.min(boundsHeight - this.height - 10, this.y));

    // 2. Thruster Flame Particles
    this.thrusterTimer += dt;
    if (this.thrusterTimer >= 35) {
      this.thrusterTimer = 0;
      const leftThrusterX = this.x + this.width * 0.28;
      const rightThrusterX = this.x + this.width * 0.72;
      const thrusterY = this.y + this.height - 4;

      const flameColor = this.overdriveTimer > 0 ? '#FF007F' : this.primaryColor;

      particles.push(
        new Particle(
          leftThrusterX,
          thrusterY,
          (Math.random() - 0.5) * 0.8,
          Math.random() * 2 + 2,
          150,
          flameColor,
          Math.random() * 2.5 + 1
        ),
        new Particle(
          rightThrusterX,
          thrusterY,
          (Math.random() - 0.5) * 0.8,
          Math.random() * 2 + 2,
          150,
          flameColor,
          Math.random() * 2.5 + 1
        )
      );
    }

    // 3. Shield & Invulnerability countdowns
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
    }
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 4. Overdrive Weapon Multi-Shot Countdown
    if (this.overdriveTimer > 0) {
      this.overdriveTimer -= dt;
    }

    // 5. Health Regeneration Processing
    this.timeSinceLastDamage += dt;
    if (this.timeSinceLastDamage >= REGEN_DELAY_MS && this.health < this.maxHealth) {
      const recovered = (REGEN_HP_PER_SEC * dt) / 1000;
      this.health = Math.min(this.maxHealth, this.health + recovered);

      // Nanite repair spark particles
      this.regenSparkTimer += dt;
      if (this.regenSparkTimer >= 220) {
        this.regenSparkTimer = 0;
        particles.push(
          new Particle(
            this.x + Math.random() * this.width,
            this.y + Math.random() * this.height,
            (Math.random() - 0.5) * 1.2,
            -Math.random() * 1.5 - 0.5,
            280,
            NEON_GREEN,
            1.8
          )
        );
      }
    }

    // 6. Reload processing
    if (this.isReloading) {
      this.reloadTimer += dt;
      this.reloadProgress = Math.min(1, this.reloadTimer / RELOAD_DURATION);

      if (this.reloadTimer >= RELOAD_DURATION) {
        this.completeReload();
      }
    } else if (input.reload) {
      this.startReload();
    }

    // 7. Low health warning sound
    if (this.health > 0 && this.health / this.maxHealth <= 0.2) {
      this.lowHealthAlertTimer += dt;
      if (this.lowHealthAlertTimer >= 800) {
        this.lowHealthAlertTimer = 0;
        AudioManager.getInstance().playEvent(AudioEvent.LOW_HEALTH);
      }
    } else {
      this.lowHealthAlertTimer = 0;
    }
  }

  tryShoot(input: InputState, projectiles: Projectile[]): boolean {
    if (!input.shoot) return false;

    const now = performance.now();
    if (this.isReloading) return false;

    // Check ammo
    if (this.ammo <= 0) {
      if (now - this.lastEmptyClickTime >= 200) {
        this.lastEmptyClickTime = now;
        AudioManager.getInstance().playEvent(AudioEvent.AMMO_EMPTY);
      }
      if (this.reserveAmmo > 0) {
        this.startReload();
      }
      return false;
    }

    // Effective Fire Rate Cooldown (faster during overdrive)
    const effectiveCooldown =
      this.overdriveTimer > 0 ? BASE_FIRE_COOLDOWN * 0.65 : BASE_FIRE_COOLDOWN;

    if (now - this.lastFireTime >= effectiveCooldown) {
      this.lastFireTime = now;
      this.ammo -= 1;

      const activeTier = this.overdriveTimer > 0 ? 5 : this.weaponTier;
      this.fireMultiShotPattern(activeTier, projectiles);

      if (activeTier >= 3) {
        AudioManager.getInstance().playEvent(AudioEvent.MULTI_SHOT);
      } else {
        AudioManager.getInstance().playEvent(AudioEvent.PLAYER_SHOT);
      }

      return true;
    }

    return false;
  }

  private fireMultiShotPattern(tier: WeaponTier, projectiles: Projectile[]) {
    const cx = this.x + this.width / 2;
    const topY = this.y - 6;

    switch (tier) {
      case 1:
        // Tier 1: Dual parallel blasters
        projectiles.push(new Projectile(cx - 14, topY, false, 0, undefined, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx + 10, topY, false, 0, undefined, PROJECTILE_DAMAGE, this.primaryColor));
        break;

      case 2:
        // Tier 2: Triple spread
        projectiles.push(new Projectile(cx - 3, topY, false, 0, undefined, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx - 16, topY + 4, false, -2.2, -12, PROJECTILE_DAMAGE * 0.9, this.primaryColor));
        projectiles.push(new Projectile(cx + 12, topY + 4, false, 2.2, -12, PROJECTILE_DAMAGE * 0.9, this.primaryColor));
        break;

      case 3:
        // Tier 3: Quad heavy blasters
        projectiles.push(new Projectile(cx - 20, topY + 4, false, -1.0, -13, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx - 8, topY, false, -0.3, -13, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx + 4, topY, false, 0.3, -13, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx + 16, topY + 4, false, 1.0, -13, PROJECTILE_DAMAGE, this.primaryColor));
        break;

      case 4:
        // Tier 4: Penta starburst (5 shots)
        projectiles.push(new Projectile(cx - 3, topY, false, 0, -13.5, PROJECTILE_DAMAGE * 1.1, this.primaryColor));
        projectiles.push(new Projectile(cx - 14, topY + 2, false, -2.5, -13, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx + 10, topY + 2, false, 2.5, -13, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx - 24, topY + 6, false, -4.8, -12, PROJECTILE_DAMAGE * 0.85, this.primaryColor));
        projectiles.push(new Projectile(cx + 20, topY + 6, false, 4.8, -12, PROJECTILE_DAMAGE * 0.85, this.primaryColor));
        break;

      case 5:
        // Tier 5: Overdrive 7-Shot Barrage
        projectiles.push(new Projectile(cx - 3, topY - 2, false, 0, -14.5, PROJECTILE_DAMAGE * 1.2, '#FFFFFF'));
        projectiles.push(new Projectile(cx - 12, topY, false, -1.8, -14, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx + 8, topY, false, 1.8, -14, PROJECTILE_DAMAGE, this.primaryColor));
        projectiles.push(new Projectile(cx - 22, topY + 4, false, -3.8, -13.5, PROJECTILE_DAMAGE * 0.9, this.primaryColor));
        projectiles.push(new Projectile(cx + 18, topY + 4, false, 3.8, -13.5, PROJECTILE_DAMAGE * 0.9, this.primaryColor));
        projectiles.push(new Projectile(cx - 30, topY + 8, false, -5.8, -12.5, PROJECTILE_DAMAGE * 0.8, NEON_CYAN));
        projectiles.push(new Projectile(cx + 26, topY + 8, false, 5.8, -12.5, PROJECTILE_DAMAGE * 0.8, NEON_CYAN));
        break;
    }
  }

  upgradeWeapon(): WeaponTier {
    if (this.weaponTier < 4) {
      this.weaponTier = (this.weaponTier + 1) as WeaponTier;
    } else {
      // Trigger Overdrive temporary super-boost
      this.overdriveTimer = OVERDRIVE_DURATION_MS;
    }
    return this.weaponTier;
  }

  activateShield() {
    this.shieldTimer = SHIELD_DURATION_MS;
    AudioManager.getInstance().playEvent(AudioEvent.SHIELD_ACTIVATE);
  }

  startReload() {
    if (this.isReloading) return;
    if (this.ammo === this.maxAmmo) return;
    if (this.reserveAmmo <= 0) return;

    this.isReloading = true;
    this.reloadTimer = 0;
    this.reloadProgress = 0;
    AudioManager.getInstance().playEvent(AudioEvent.RELOAD_STARTED);
  }

  private completeReload() {
    this.isReloading = false;
    this.reloadTimer = 0;
    this.reloadProgress = 0;

    const needed = this.maxAmmo - this.ammo;
    const toLoad = Math.min(needed, this.reserveAmmo);
    this.ammo += toLoad;
    this.reserveAmmo -= toLoad;
  }

  takeDamage(amount: number): boolean {
    // Shield blocks all damage
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - 400);
      AudioManager.getInstance().playEvent(AudioEvent.BULLET_WALL_IMPACT);
      return false;
    }

    if (this.invulnerableTimer > 0) return false;

    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = INVULNERABILITY_DURATION;
    this.timeSinceLastDamage = 0; // Reset regen timer

    AudioManager.getInstance().playEvent(AudioEvent.PLAYER_HURT);
    return true;
  }

  collidesWith(target: { x: number; y: number; width: number; height: number }): boolean {
    const inset = 6;
    return (
      this.x + inset < target.x + target.width &&
      this.x + this.width - inset > target.x &&
      this.y + inset < target.y + target.height &&
      this.y + this.height - inset > target.y
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Invulnerability flicker
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const w = this.width;
    const h = this.height;

    // Glowing energy shield orb if active
    if (this.shieldTimer > 0) {
      ctx.save();
      ctx.shadowColor = '#3A86FF';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#3A86FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(w, h) * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(58, 134, 255, 0.12)';
      ctx.fill();
      ctx.restore();
    }

    // Outer neon ship glow
    ctx.shadowColor = this.overdriveTimer > 0 ? '#FF007F' : this.primaryColor;
    ctx.shadowBlur = this.overdriveTimer > 0 ? 25 : 18;

    // Spaceship Hull
    ctx.fillStyle = '#1A0E2E';
    ctx.strokeStyle = this.primaryColor;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w * 0.2, -h * 0.1);
    ctx.lineTo(w * 0.5, h * 0.35);
    ctx.lineTo(w * 0.45, h * 0.5);
    ctx.lineTo(w * 0.22, h * 0.35);
    ctx.lineTo(0, h * 0.25);
    ctx.lineTo(-w * 0.22, h * 0.35);
    ctx.lineTo(-w * 0.45, h * 0.5);
    ctx.lineTo(-w * 0.5, h * 0.35);
    ctx.lineTo(-w * 0.2, -h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Neon Wing Stripes
    ctx.strokeStyle = this.primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, h * 0.3);
    ctx.lineTo(-w * 0.15, 0);
    ctx.moveTo(w * 0.35, h * 0.3);
    ctx.lineTo(w * 0.15, 0);
    ctx.stroke();

    // High-tech Glowing Cockpit Canopy
    ctx.shadowColor = this.accentColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.12, w * 0.12, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reflection Highlight
    ctx.fillStyle = NEON_WHITE;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.18, w * 0.05, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Multi-shot Wing Cannons
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = NEON_WHITE;
    ctx.fillRect(-w * 0.42, h * 0.1, 3, 10);
    ctx.fillRect(w * 0.42 - 3, h * 0.1, 3, 10);

    // Player ID Tag for 2-Player Co-Op
    if (this.id === 'p2') {
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.accentColor;
      ctx.font = 'bold 9px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P2', 0, h * 0.5 + 10);
    }

    ctx.restore();
  }
}
