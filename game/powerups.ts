import {
  POWERUP_SIZE,
  POWERUP_SPEED,
  POWERUP_LIFETIME,
  BRAND_PINK,
  NEON_CYAN,
  NEON_GREEN,
  GOLD_ACCENT,
  NEON_WHITE,
} from './constants';
import { PowerUpType } from './types';
import { Player } from './player';

export class PowerUp {
  public x: number;
  public y: number;
  public width = POWERUP_SIZE;
  public height = POWERUP_SIZE;
  public type: PowerUpType;
  public life = POWERUP_LIFETIME;
  public maxLife = POWERUP_LIFETIME;
  public vy = POWERUP_SPEED;
  private oscillation = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, type?: PowerUpType) {
    this.x = x;
    this.y = y;

    if (type) {
      this.type = type;
    } else {
      // Randomized weighted selection
      const rand = Math.random();
      if (rand < 0.28) {
        this.type = 'weapon'; // 28%
      } else if (rand < 0.52) {
        this.type = 'health'; // 24%
      } else if (rand < 0.72) {
        this.type = 'ammo'; // 20%
      } else if (rand < 0.88) {
        this.type = 'shield'; // 16%
      } else {
        this.type = 'crystal'; // 12%
      }
    }
  }

  update(dt: number) {
    this.life -= dt;
    this.y += this.vy;
    this.oscillation += dt * 0.004;
    this.x += Math.sin(this.oscillation) * 0.6;
  }

  isExpired(): boolean {
    return this.life <= 0 || this.y > 750;
  }

  collidesWith(player: Player): boolean {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  getColor(): string {
    switch (this.type) {
      case 'weapon':
        return BRAND_PINK;
      case 'health':
        return NEON_GREEN;
      case 'ammo':
        return NEON_CYAN;
      case 'shield':
        return '#3A86FF';
      case 'crystal':
        return GOLD_ACCENT;
    }
  }

  getLabel(): string {
    switch (this.type) {
      case 'weapon':
        return 'WPN+';
      case 'health':
        return 'HP+';
      case 'ammo':
        return 'AMMO';
      case 'shield':
        return 'SHIELD';
      case 'crystal':
        return '+500';
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Flash when about to expire (< 2.5s)
    if (this.life < 2500 && Math.floor(this.life / 150) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const color = this.getColor();
    const half = this.width / 2;

    // Glowing outline
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // Outer Rotating Diamond Container
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(5, 5, 16, 0.85)';

    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half, 0);
    ctx.lineTo(0, half);
    ctx.lineTo(-half, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Symbol Rendering based on type
    ctx.fillStyle = color;
    ctx.shadowBlur = 6;

    switch (this.type) {
      case 'weapon':
        // Triple chevron / arrow
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(5, 3);
        ctx.lineTo(0, 0);
        ctx.lineTo(-5, 3);
        ctx.closePath();
        ctx.fill();
        break;

      case 'health':
        // Medical cross
        ctx.fillRect(-2.5, -6, 5, 12);
        ctx.fillRect(-6, -2.5, 12, 5);
        break;

      case 'ammo':
        // Ammo cartridge
        ctx.fillRect(-3, -5, 6, 10);
        ctx.fillStyle = NEON_WHITE;
        ctx.fillRect(-1.5, -6.5, 3, 2);
        break;

      case 'shield':
        // Plasma circle ring
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'crystal':
        // Star crystal
        ctx.fillStyle = GOLD_ACCENT;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }
}

