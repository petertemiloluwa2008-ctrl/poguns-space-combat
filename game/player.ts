import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PROJECTILE_DAMAGE,
  MAGAZINE_CAPACITY,
  INITIAL_RESERVE_AMMO,
  RELOAD_DURATION,
  INVULNERABILITY_DURATION,
  REGEN_DELAY_MS,
  REGEN_HP_PER_SEC,
  MAX_BOMBS,
  INITIAL_BOMBS,
  SHIELD_DURATION_MS,
  RAPID_FIRE_DURATION_MS,
  INVINCIBLE_DURATION_MS,
  BRAND_PINK,
  NEON_WHITE,
  NEON_CYAN,
  NEON_GREEN,
  GOLD_ACCENT,
  DANGER_RED,
} from './constants';
import { Projectile } from './projectiles';
import { InputState } from './input';
import { Particle } from './particles';
import { AudioManager } from './audio/AudioManager';
import { AudioEvent } from './audio/audioEvents';
import { WeaponTier } from './types';
import { ShipId, SHIPS, ShipConfig } from './ships';

export class Player {
  public id: 'p1' | 'p2';
  public shipId: ShipId;
  public shipConfig: ShipConfig;

  public x: number;
  public y: number;
  public width = PLAYER_WIDTH;
  public height = PLAYER_HEIGHT;
  public speed: number;

  public health: number;
  public maxHealth: number;
  public kills = 0;

  // Custom Colors
  public primaryColor: string;
  public accentColor: string;

  // Weapon Systems & Multi-Shot
  public weaponTier: WeaponTier = 1;
  public isAutoFiring = true;

  // Power-Ups & Status Timers
  public shieldTimer = 0;
  public rapidFireTimer = 0;
  public invulnerabilityPowerTimer = 0;
  public invulnerableHurtTimer = 0;

  // Power Shot Mechanics
  public powerShotCharge = 0; // 0 to 1
  public isPowerShotActive = false;
  public powerShotActiveTimer = 0;

  // Bombs
  public bombs = INITIAL_BOMBS;

  // Ammo & Reloading
  public ammo = MAGAZINE_CAPACITY;
  public maxAmmo = MAGAZINE_CAPACITY;
  public reserveAmmo = INITIAL_RESERVE_AMMO;
  public isReloading = false;
  public reloadProgress = 0;
  private reloadTimer = 0;

  // Timers
  public lastFireTime = 0;
  public timeSinceLastDamage = 0;
  private regenSparkTimer = 0;
  private lowHealthAlertTimer = 0;
  private thrusterTimer = 0;

  constructor(
    x: number,
    y: number,
    id: 'p1' | 'p2' = 'p1',
    shipId: ShipId = 'vanguard'
  ) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.shipId = shipId;
    this.shipConfig = SHIPS[shipId] || SHIPS.vanguard;

    this.health = this.shipConfig.health;
    this.maxHealth = this.shipConfig.maxHealth;
    this.speed = this.shipConfig.speed;
    this.primaryColor = this.shipConfig.primaryColor;
    this.accentColor = this.shipConfig.accentColor;
  }

  public setShip(shipId: ShipId) {
    this.shipId = shipId;
    this.shipConfig = SHIPS[shipId] || SHIPS.vanguard;
    this.health = this.shipConfig.health;
    this.maxHealth = this.shipConfig.maxHealth;
    this.speed = this.shipConfig.speed;
    this.primaryColor = this.shipConfig.primaryColor;
    this.accentColor = this.shipConfig.accentColor;
  }

  update(
    dt: number,
    input: InputState,
    boundsWidth: number,
    boundsHeight: number,
    particles: Particle[],
    projectiles: Projectile[]
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

    // 2. Thruster flame particles
    this.thrusterTimer += dt;
    if (this.thrusterTimer >= 30) {
      this.thrusterTimer = 0;
      const leftThrusterX = this.x + this.width * 0.28;
      const rightThrusterX = this.x + this.width * 0.72;
      const thrusterY = this.y + this.height - 3;

      const flameColor =
        this.invulnerabilityPowerTimer > 0
          ? GOLD_ACCENT
          : this.rapidFireTimer > 0
          ? '#FFB800'
          : this.primaryColor;

      particles.push(
        new Particle(
          leftThrusterX,
          thrusterY,
          (Math.random() - 0.5) * 0.8,
          Math.random() * 2.2 + 2,
          150,
          flameColor,
          Math.random() * 2.5 + 1.2
        ),
        new Particle(
          rightThrusterX,
          thrusterY,
          (Math.random() - 0.5) * 0.8,
          Math.random() * 2.2 + 2,
          150,
          flameColor,
          Math.random() * 2.5 + 1.2
        )
      );
    }

    // 3. Power-Up & Bonus Countdowns
    if (this.shieldTimer > 0) this.shieldTimer -= dt;
    if (this.rapidFireTimer > 0) this.rapidFireTimer -= dt;
    if (this.invulnerabilityPowerTimer > 0) this.invulnerabilityPowerTimer -= dt;
    if (this.invulnerableHurtTimer > 0) this.invulnerableHurtTimer -= dt;

    // 4. Power Shot Passive Charging & Active Beam
    if (!this.isPowerShotActive && this.powerShotCharge < 1) {
      const chargeRate = dt / this.shipConfig.powerShotCooldown;
      this.powerShotCharge = Math.min(1, this.powerShotCharge + chargeRate);
    }

    if (this.isPowerShotActive) {
      this.powerShotActiveTimer -= dt;
      if (this.powerShotActiveTimer <= 0) {
        this.isPowerShotActive = false;
      }
    }

    // 5. Health Regeneration Processing
    this.timeSinceLastDamage += dt;
    if (this.timeSinceLastDamage >= REGEN_DELAY_MS && this.health < this.maxHealth) {
      const recovered = (REGEN_HP_PER_SEC * dt) / 1000;
      this.health = Math.min(this.maxHealth, this.health + recovered);

      this.regenSparkTimer += dt;
      if (this.regenSparkTimer >= 200) {
        this.regenSparkTimer = 0;
        particles.push(
          new Particle(
            this.x + Math.random() * this.width,
            this.y + Math.random() * this.height,
            (Math.random() - 0.5) * 1.2,
            -Math.random() * 1.5 - 0.5,
            280,
            NEON_GREEN,
            2.0
          )
        );
      }
    }

    // 6. Reload Processing
    if (this.isReloading) {
      this.reloadTimer += dt;
      this.reloadProgress = Math.min(1, this.reloadTimer / RELOAD_DURATION);

      if (this.reloadTimer >= RELOAD_DURATION) {
        this.completeReload();
      }
    } else if (input.reload) {
      this.startReload();
    }

    // 7. Automatic Shooting Loop
    if (this.isAutoFiring && !this.isReloading) {
      this.tryAutoShoot(projectiles);
    }

    // 8. Low Health Warning Alert
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

  public tryAutoShoot(projectiles: Projectile[]): boolean {
    const now = performance.now();

    // Fire cooldown calculated with ship stats and rapid-fire bonus
    let effectiveCooldown = this.shipConfig.baseFireCooldown;
    if (this.rapidFireTimer > 0) {
      effectiveCooldown *= 0.6; // 40% faster fire rate
    }

    if (now - this.lastFireTime >= effectiveCooldown) {
      this.lastFireTime = now;

      // Handle ammo reduction
      this.ammo -= 1;
      if (this.ammo <= 0) {
        this.startReload();
      }

      // Fire weapon based on level tier
      this.fireWeaponTierPattern(this.weaponTier, projectiles);

      if (this.weaponTier >= 3 || this.rapidFireTimer > 0) {
        AudioManager.getInstance().playEvent(AudioEvent.MULTI_SHOT);
      } else {
        AudioManager.getInstance().playEvent(AudioEvent.PLAYER_SHOT);
      }

      return true;
    }

    return false;
  }

  private fireWeaponTierPattern(tier: WeaponTier, projectiles: Projectile[]) {
    const cx = this.x + this.width / 2;
    const topY = this.y - 6;
    const boltColor = this.rapidFireTimer > 0 ? '#FFB800' : this.primaryColor;

    switch (tier) {
      case 1:
        // Level 1: Single forward gun
        projectiles.push(
          new Projectile(cx - 3, topY, false, 0, undefined, PROJECTILE_DAMAGE, boltColor)
        );
        break;

      case 2:
        // Level 2: Dual parallel guns
        projectiles.push(
          new Projectile(cx - 14, topY, false, 0, undefined, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx + 10, topY, false, 0, undefined, PROJECTILE_DAMAGE, boltColor)
        );
        break;

      case 3:
        // Level 3: Triple spread (0, +/- 12 deg)
        projectiles.push(
          new Projectile(cx - 3, topY, false, 0, undefined, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx - 16, topY + 4, false, -2.2, -12.5, PROJECTILE_DAMAGE * 0.9, boltColor)
        );
        projectiles.push(
          new Projectile(cx + 12, topY + 4, false, 2.2, -12.5, PROJECTILE_DAMAGE * 0.9, boltColor)
        );
        break;

      case 4:
        // Level 4: Quad heavy guns
        projectiles.push(
          new Projectile(cx - 20, topY + 4, false, -1.0, -13, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx - 8, topY, false, -0.3, -13, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx + 4, topY, false, 0.3, -13, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx + 16, topY + 4, false, 1.0, -13, PROJECTILE_DAMAGE, boltColor)
        );
        break;

      case 5:
        // Level 5: Penta starburst + dual wing lasers
        projectiles.push(
          new Projectile(cx - 3, topY - 2, false, 0, -14.5, PROJECTILE_DAMAGE * 1.25, NEON_WHITE)
        );
        projectiles.push(
          new Projectile(cx - 14, topY + 2, false, -2.2, -13.5, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx + 10, topY + 2, false, 2.2, -13.5, PROJECTILE_DAMAGE, boltColor)
        );
        projectiles.push(
          new Projectile(cx - 26, topY + 6, false, -4.5, -12.5, PROJECTILE_DAMAGE * 0.9, NEON_CYAN)
        );
        projectiles.push(
          new Projectile(cx + 22, topY + 6, false, 4.5, -12.5, PROJECTILE_DAMAGE * 0.9, NEON_CYAN)
        );
        break;
    }
  }

  // --- POWER SHOT ACTIVATION ---
  public tryTriggerPowerShot(): boolean {
    if (this.powerShotCharge >= 1 && !this.isPowerShotActive) {
      this.isPowerShotActive = true;
      this.powerShotActiveTimer = 1200; // 1.2s mega laser beam
      this.powerShotCharge = 0;
      AudioManager.getInstance().playEvent(AudioEvent.POWER_SHOT);
      return true;
    }
    return false;
  }

  // --- EMP BOMB DEPLOYMENT ---
  public tryDeployBomb(): boolean {
    if (this.bombs > 0) {
      this.bombs -= 1;
      AudioManager.getInstance().playEvent(AudioEvent.BOMB_EXPLOSION);
      return true;
    }
    return false;
  }

  // --- POWER-UP BONUS APPLIERS ---
  public upgradeWeapon(): WeaponTier {
    if (this.weaponTier < 5) {
      this.weaponTier = (this.weaponTier + 1) as WeaponTier;
    } else {
      // Trigger Rapid Fire surge
      this.rapidFireTimer = RAPID_FIRE_DURATION_MS;
    }
    return this.weaponTier;
  }

  public activateShield() {
    this.shieldTimer = SHIELD_DURATION_MS;
    AudioManager.getInstance().playEvent(AudioEvent.SHIELD_ACTIVATE);
  }

  public activateRapidFire() {
    this.rapidFireTimer = RAPID_FIRE_DURATION_MS;
    AudioManager.getInstance().playEvent(AudioEvent.POWERUP_PICKUP);
  }

  public activateInvincibility() {
    this.invulnerabilityPowerTimer = INVINCIBLE_DURATION_MS;
    AudioManager.getInstance().playEvent(AudioEvent.INVULN_ACTIVATE);
  }

  public addBomb() {
    this.bombs = Math.min(MAX_BOMBS, this.bombs + 1);
  }

  public startReload() {
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

  public takeDamage(amount: number): boolean {
    // 1. Invincibility blocks damage
    if (this.invulnerabilityPowerTimer > 0 || this.invulnerableHurtTimer > 0) {
      return false;
    }

    // 2. Shield blocks damage
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - 350);
      AudioManager.getInstance().playEvent(AudioEvent.BULLET_WALL_IMPACT);
      return false;
    }

    // 3. Apply ship armor damage reduction
    const effectiveDamage = Math.max(5, Math.round(amount * (1 - this.shipConfig.armorReduction)));
    this.health = Math.max(0, this.health - effectiveDamage);
    this.invulnerableHurtTimer = INVULNERABILITY_DURATION;
    this.timeSinceLastDamage = 0;

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
    // Flicker on hurt invulnerability
    if (this.invulnerableHurtTimer > 0 && Math.floor(this.invulnerableHurtTimer / 75) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const w = this.width;
    const h = this.height;

    // --- 1. POWER SHOT MEGA LASER BEAM ---
    if (this.isPowerShotActive) {
      ctx.save();
      const beamGlow = ctx.createLinearGradient(-18, 0, 18, 0);
      beamGlow.addColorStop(0, 'rgba(255, 20, 147, 0)');
      beamGlow.addColorStop(0.3, this.primaryColor);
      beamGlow.addColorStop(0.5, '#FFFFFF');
      beamGlow.addColorStop(0.7, this.primaryColor);
      beamGlow.addColorStop(1, 'rgba(255, 20, 147, 0)');

      ctx.fillStyle = beamGlow;
      ctx.shadowColor = this.primaryColor;
      ctx.shadowBlur = 30;
      ctx.fillRect(-22, -h / 2 - 800, 44, 800);
      ctx.restore();
    }

    // --- 2. INVINCIBILITY GOLDEN / PINK AURA ---
    if (this.invulnerabilityPowerTimer > 0) {
      ctx.save();
      ctx.shadowColor = GOLD_ACCENT;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = GOLD_ACCENT;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(w, h) * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // --- 3. PLASMA SHIELD BARRIER ---
    if (this.shieldTimer > 0) {
      ctx.save();
      ctx.shadowColor = '#3A86FF';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#3A86FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(w, h) * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(58, 134, 255, 0.14)';
      ctx.fill();
      ctx.restore();
    }

    // --- 4. SPACESHIP HULL RENDERING BASED ON SHIP ID ---
    ctx.shadowColor = this.primaryColor;
    ctx.shadowBlur = this.rapidFireTimer > 0 ? 25 : 18;

    switch (this.shipId) {
      case 'vanguard':
        this.drawVanguardHull(ctx, w, h);
        break;
      case 'phantom':
        this.drawPhantomHull(ctx, w, h);
        break;
      case 'titan':
        this.drawTitanHull(ctx, w, h);
        break;
      case 'spectre':
        this.drawSpectreHull(ctx, w, h);
        break;
      default:
        this.drawVanguardHull(ctx, w, h);
    }

    ctx.restore();
  }

  // --- HULL DRAW ROUTINES ---
  private drawVanguardHull(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

    // Cockpit
    ctx.fillStyle = this.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.12, w * 0.12, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cannons
    ctx.fillStyle = NEON_WHITE;
    ctx.fillRect(-w * 0.42, h * 0.1, 3, 10);
    ctx.fillRect(w * 0.42 - 3, h * 0.1, 3, 10);
  }

  private drawPhantomHull(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#002B36';
    ctx.strokeStyle = NEON_CYAN;
    ctx.lineWidth = 2.2;

    // Needle fighter
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.55);
    ctx.lineTo(w * 0.15, -h * 0.15);
    ctx.lineTo(w * 0.48, h * 0.4);
    ctx.lineTo(w * 0.35, h * 0.5);
    ctx.lineTo(0, h * 0.3);
    ctx.lineTo(-w * 0.35, h * 0.5);
    ctx.lineTo(-w * 0.48, h * 0.4);
    ctx.lineTo(-w * 0.15, -h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.15, w * 0.08, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTitanHull(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#2B0E00';
    ctx.strokeStyle = '#FF5400';
    ctx.lineWidth = 3.5;

    // Heavy fortress
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.45);
    ctx.lineTo(w * 0.3, -h * 0.3);
    ctx.lineTo(w * 0.52, h * 0.2);
    ctx.lineTo(w * 0.35, h * 0.5);
    ctx.lineTo(-w * 0.35, h * 0.5);
    ctx.lineTo(-w * 0.52, h * 0.2);
    ctx.lineTo(-w * 0.3, -h * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heavy Armor Core
    ctx.fillStyle = DANGER_RED;
    ctx.fillRect(-w * 0.2, -h * 0.1, w * 0.4, h * 0.3);
  }

  private drawSpectreHull(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#1D002B';
    ctx.strokeStyle = '#9D4EDD';
    ctx.lineWidth = 2.8;

    // Curved energy wings
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.52);
    ctx.lineTo(w * 0.25, -h * 0.2);
    ctx.lineTo(w * 0.5, h * 0.25);
    ctx.lineTo(w * 0.3, h * 0.45);
    ctx.lineTo(0, h * 0.2);
    ctx.lineTo(-w * 0.3, h * 0.45);
    ctx.lineTo(-w * 0.5, h * 0.25);
    ctx.lineTo(-w * 0.25, -h * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing energy crystal core
    ctx.fillStyle = GOLD_ACCENT;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
