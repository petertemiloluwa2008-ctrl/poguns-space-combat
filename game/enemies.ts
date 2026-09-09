import { ENEMY_CONFIGS, EnemyConfig, DANGER_RED, NEON_WHITE, BRAND_PINK, NEON_CYAN } from './constants';
import { Projectile } from './projectiles';
import { EnemyType, BossPhase } from './types';
import { Player } from './player';

export class Enemy {
  public type: EnemyType;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public score: number;
  public damage: number;
  public color: string;
  public glowColor: string;

  public bossPhase: BossPhase = 1;
  public bossShieldActive = false;

  private shootTimer = 0;
  private shootCooldown?: number;
  private horizontalDir: number;
  private oscillationTimer = 0;
  private cloakTimer = 0;
  public isCloaked = false;
  private specialAttackTimer = 0;

  constructor(type: EnemyType, x: number, y: number, speedMultiplier = 1) {
    this.type = type;
    this.x = x;
    this.y = y;

    const config: EnemyConfig = ENEMY_CONFIGS[type];
    this.width = config.width;
    this.height = config.height;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed * speedMultiplier;
    this.score = config.score;
    this.damage = config.damage;
    this.color = config.color;
    this.glowColor = config.glowColor;
    this.shootCooldown = config.shootCooldown;

    this.horizontalDir = Math.random() > 0.5 ? 1 : -1;
    this.shootTimer = Math.random() * 400;
  }

  update(
    dt: number,
    players: Player[],
    enemyProjectiles: Projectile[],
    arenaWidth: number,
    spawnMinion?: (type: EnemyType, x: number, y: number) => void
  ) {
    this.oscillationTimer += dt * 0.003;

    // Pick closest living player as target
    const targetPlayer =
      players.find((p) => p.health > 0) || players[0];

    // Behavior based on type
    switch (this.type) {
      case 'basic':
        this.y += this.speed;
        if (targetPlayer) {
          const targetX = targetPlayer.x + targetPlayer.width / 2 - (this.x + this.width / 2);
          this.x += Math.sign(targetX) * 0.45;
        }
        break;

      case 'fast':
        this.y += this.speed;
        this.x += Math.sin(this.oscillationTimer * 3.5) * 2.8;
        break;

      case 'heavy':
        this.y += this.speed;
        break;

      case 'shooter':
        this.y += this.speed * 0.85;
        this.x += this.horizontalDir * 1.4;
        if (this.x <= 20 || this.x + this.width >= arenaWidth - 20) {
          this.horizontalDir *= -1;
        }

        if (this.shootCooldown) {
          this.shootTimer += dt;
          if (this.shootTimer >= this.shootCooldown) {
            this.shootTimer = 0;
            const projX = this.x + this.width / 2 - 4;
            const projY = this.y + this.height + 2;
            enemyProjectiles.push(new Projectile(projX, projY, true));
          }
        }
        break;

      case 'stealth':
        this.y += this.speed * 0.9;
        this.cloakTimer += dt;
        // Cloak cycles: 2s invisible, 1.5s visible
        this.isCloaked = Math.sin(this.cloakTimer * 0.002) > 0.1;

        if (this.shootCooldown) {
          this.shootTimer += dt;
          if (this.shootTimer >= this.shootCooldown) {
            this.shootTimer = 0;
            const cx = this.x + this.width / 2;
            enemyProjectiles.push(new Projectile(cx - 10, this.y + this.height, true, -0.8, 5.2));
            enemyProjectiles.push(new Projectile(cx + 10, this.y + this.height, true, 0.8, 5.2));
          }
        }
        break;

      case 'kamikaze':
        // High speed homing missile directly toward target
        this.y += this.speed * 0.75;
        if (targetPlayer) {
          const dx = targetPlayer.x + targetPlayer.width / 2 - (this.x + this.width / 2);
          this.x += Math.sign(dx) * Math.min(Math.abs(dx), this.speed * 0.65);
        }
        break;

      case 'elite':
        this.y += this.speed * 0.7;
        this.x += this.horizontalDir * 1.8;
        if (this.x <= 30 || this.x + this.width >= arenaWidth - 30) {
          this.horizontalDir *= -1;
        }

        if (this.shootCooldown) {
          this.shootTimer += dt;
          if (this.shootTimer >= this.shootCooldown) {
            this.shootTimer = 0;
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height;
            // Dual heavy plasma bolts
            enemyProjectiles.push(new Projectile(cx - 16, cy, true, -1.2, 5.8, 25, '#FF007F'));
            enemyProjectiles.push(new Projectile(cx + 16, cy, true, 1.2, 5.8, 25, '#FF007F'));
          }
        }
        break;

      case 'shield':
        this.y += this.speed * 0.85;
        this.x += Math.sin(this.oscillationTimer * 1.5) * 1.2;
        break;

      case 'boss':
        this.updateBossBehavior(dt, targetPlayer, enemyProjectiles, arenaWidth, spawnMinion);
        break;
    }
  }

  private updateBossBehavior(
    dt: number,
    targetPlayer: Player | undefined,
    enemyProjectiles: Projectile[],
    arenaWidth: number,
    spawnMinion?: (type: EnemyType, x: number, y: number) => void
  ) {
    // Boss Phase transitions based on HP
    const hpRatio = this.health / this.maxHealth;
    if (hpRatio > 0.6) {
      this.bossPhase = 1;
      this.bossShieldActive = false;
    } else if (hpRatio > 0.25) {
      this.bossPhase = 2;
    } else {
      this.bossPhase = 3; // Rage mode
      this.bossShieldActive = false;
    }

    // Hover into battle arena
    if (this.y < 80) {
      this.y += this.speed * 0.7;
    }

    // Horizontal strafing speed
    const strafeSpeed = this.bossPhase === 3 ? 2.8 : this.bossPhase === 2 ? 2.0 : 1.5;
    this.x += this.horizontalDir * strafeSpeed;
    if (this.x <= 25 || this.x + this.width >= arenaWidth - 25) {
      this.horizontalDir *= -1;
    }

    this.shootTimer += dt;
    this.specialAttackTimer += dt;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height - 10;

    // --- PHASE 1 ATTACKS ---
    if (this.bossPhase === 1) {
      if (this.shootTimer >= 700) {
        this.shootTimer = 0;
        enemyProjectiles.push(new Projectile(cx - 36, cy, true, -1.5, 5.0, 20, BRAND_PINK));
        enemyProjectiles.push(new Projectile(cx, cy + 8, true, 0, 5.8, 25, NEON_WHITE));
        enemyProjectiles.push(new Projectile(cx + 36, cy, true, 1.5, 5.0, 20, BRAND_PINK));
      }

      // Minion escort spawn every 8s
      if (this.specialAttackTimer >= 8000 && spawnMinion) {
        this.specialAttackTimer = 0;
        spawnMinion('fast', cx - 80, this.y + 40);
        spawnMinion('fast', cx + 80, this.y + 40);
      }
    }

    // --- PHASE 2 ATTACKS (Spiral / 5-Way Blast) ---
    else if (this.bossPhase === 2) {
      if (this.shootTimer >= 550) {
        this.shootTimer = 0;
        [-3.2, -1.6, 0, 1.6, 3.2].forEach((vx) => {
          enemyProjectiles.push(
            new Projectile(cx + vx * 8, cy, true, vx, 5.2, 22, '#9D4EDD')
          );
        });
      }

      // Intermittent energy shield
      this.bossShieldActive = Math.sin(this.specialAttackTimer * 0.0015) > 0.45;
    }

    // --- PHASE 3 ATTACKS (Rage Nova Hell) ---
    else if (this.bossPhase === 3) {
      if (this.shootTimer >= 400) {
        this.shootTimer = 0;
        const count = 8;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * (i / (count - 1))) + (Math.random() - 0.5) * 0.2;
          const speed = 4.8;
          enemyProjectiles.push(
            new Projectile(
              cx,
              cy,
              true,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              25,
              DANGER_RED
            )
          );
        }
      }
    }
  }

  takeDamage(amount: number) {
    if (this.bossShieldActive) {
      return; // Absorbed by shield
    }
    this.health = Math.max(0, this.health - amount);
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.y > canvasHeight + 80;
  }

  collidesWith(target: { x: number; y: number; width: number; height: number }): boolean {
    return (
      this.x < target.x + target.width &&
      this.x + this.width > target.x &&
      this.y < target.y + target.height &&
      this.y + this.height > target.y
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const w = this.width;
    const h = this.height;

    // Stealth cloak alpha
    if (this.type === 'stealth' && this.isCloaked) {
      ctx.globalAlpha = 0.2;
    }

    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = this.type === 'boss' ? (this.bossPhase === 3 ? 30 : 18) : 12;

    switch (this.type) {
      case 'basic':
        ctx.fillStyle = '#18002E';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        ctx.lineTo(-w * 0.5, -h * 0.35);
        ctx.lineTo(-w * 0.25, -h * 0.5);
        ctx.lineTo(w * 0.25, -h * 0.5);
        ctx.lineTo(w * 0.5, -h * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = DANGER_RED;
        ctx.beginPath();
        ctx.arc(0, -h * 0.05, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'fast':
        ctx.fillStyle = '#002B36';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.lineTo(-w * 0.45, -h * 0.45);
        ctx.lineTo(0, -h * 0.2);
        ctx.lineTo(w * 0.45, -h * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = NEON_WHITE;
        ctx.fillRect(-2, -h * 0.45, 4, 3);
        break;

      case 'heavy':
        ctx.fillStyle = '#2B1400';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.5);
        ctx.lineTo(w * 0.5, -h * 0.1);
        ctx.lineTo(w * 0.25, h * 0.5);
        ctx.lineTo(-w * 0.25, h * 0.5);
        ctx.lineTo(-w * 0.5, -h * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.fillRect(-w * 0.2, -h * 0.2, w * 0.4, h * 0.3);
        break;

      case 'shooter':
        ctx.fillStyle = '#300008';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.4);
        ctx.lineTo(-w * 0.4, -h * 0.4);
        ctx.lineTo(0, -h * 0.5);
        ctx.lineTo(w * 0.4, -h * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = DANGER_RED;
        ctx.fillRect(-w * 0.38, 0, 4, 10);
        ctx.fillRect(w * 0.38 - 4, 0, 4, 10);
        break;

      case 'stealth':
        ctx.fillStyle = '#1D0047';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        ctx.lineTo(w * 0.4, -h * 0.4);
        ctx.lineTo(0, -h * 0.2);
        ctx.lineTo(-w * 0.4, -h * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = NEON_CYAN;
        ctx.fillRect(-2, -h * 0.1, 4, 4);
        break;

      case 'kamikaze':
        ctx.fillStyle = '#4D0011';
        ctx.strokeStyle = DANGER_RED;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.lineTo(-w * 0.5, -h * 0.4);
        ctx.lineTo(w * 0.5, -h * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF5400';
        ctx.beginPath();
        ctx.arc(0, -h * 0.1, 6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'elite':
        ctx.fillStyle = '#2A0021';
        ctx.strokeStyle = '#FF007F';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        ctx.lineTo(w * 0.45, h * 0.1);
        ctx.lineTo(w * 0.35, -h * 0.45);
        ctx.lineTo(-w * 0.35, -h * 0.45);
        ctx.lineTo(-w * 0.45, h * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF69C9';
        ctx.fillRect(-w * 0.3, -h * 0.1, 5, 12);
        ctx.fillRect(w * 0.3 - 5, -h * 0.1, 5, 12);
        break;

      case 'shield':
        // Armored guardian with a front energy barrier
        ctx.fillStyle = '#051923';
        ctx.strokeStyle = '#00A8E8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -h * 0.4);
        ctx.lineTo(w * 0.4, -h * 0.4);
        ctx.lineTo(w * 0.3, h * 0.3);
        ctx.lineTo(0, h * 0.5);
        ctx.lineTo(-w * 0.3, h * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Front glowing shield arc
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, h * 0.1, w * 0.5, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();

        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        ctx.arc(0, -h * 0.05, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'boss':
        // Boss Flagship Dreadnought Prime
        const hullStroke = this.bossPhase === 3 ? DANGER_RED : this.glowColor;
        ctx.fillStyle = '#1D002B';
        ctx.strokeStyle = hullStroke;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(0, h * 0.52);
        ctx.lineTo(w * 0.28, h * 0.22);
        ctx.lineTo(w * 0.5, -h * 0.15);
        ctx.lineTo(w * 0.44, -h * 0.5);
        ctx.lineTo(w * 0.16, -h * 0.35);
        ctx.lineTo(0, -h * 0.48);
        ctx.lineTo(-w * 0.16, -h * 0.35);
        ctx.lineTo(-w * 0.44, -h * 0.5);
        ctx.lineTo(-w * 0.5, -h * 0.15);
        ctx.lineTo(-w * 0.28, h * 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Boss Reactor Core
        ctx.shadowColor = this.bossPhase === 3 ? '#FF0054' : BRAND_PINK;
        ctx.fillStyle = this.bossPhase === 3 ? '#FF0054' : BRAND_PINK;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = NEON_WHITE;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();

        // Boss Shield Bubble if active
        if (this.bossShieldActive) {
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.58, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }

    // Health Bar for regular damaged enemies (Boss HUD renders top bar)
    if (this.type !== 'boss' && this.health < this.maxHealth) {
      const barW = Math.max(w, 40);
      const barH = 4;
      const barY = -h / 2 - 10;
      const healthPct = Math.max(0, this.health / this.maxHealth);

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-barW / 2, barY, barW, barH);

      ctx.fillStyle = healthPct > 0.5 ? this.glowColor : DANGER_RED;
      ctx.fillRect(-barW / 2, barY, barW * healthPct, barH);
    }

    ctx.restore();
  }
}
