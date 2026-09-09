import {
  POWERUP_SIZE,
  POWERUP_SPEED,
  POWERUP_LIFETIME,
  BRAND_PINK,
  NEON_CYAN,
  NEON_GREEN,
  GOLD_ACCENT,
  NEON_WHITE,
  DANGER_RED,
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
      // Balanced randomized selection
      const rand = Math.random();
      if (rand < 0.22) {
        this.type = 'weapon'; // 22%
      } else if (rand < 0.42) {
        this.type = 'health'; // 20%
      } else if (rand < 0.58) {
        this.type = 'shield'; // 16%
      } else if (rand < 0.74) {
        this.type = 'rapid'; // 16%
      } else if (rand < 0.86) {
        this.type = 'bomb'; // 12%
      } else if (rand < 0.94) {
        this.type = 'invuln'; // 8%
      } else {
        this.type = 'crystal'; // 6%
      }
    }
  }

  update(dt: number) {
    this.life -= dt;
    this.y += this.vy;
    this.oscillation += dt * 0.004;
    this.x += Math.sin(this.oscillation) * 0.65;
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
      case 'shield':
        return '#3A86FF';
      case 'rapid':
        return '#FFB800';
      case 'bomb':
        return DANGER_RED;
      case 'invuln':
        return GOLD_ACCENT;
      case 'crystal':
        return '#C77DFF';
    }
  }

  getLabel(): string {
    switch (this.type) {
      case 'weapon':
        return 'WEAPON+';
      case 'health':
        return 'HEALTH+';
      case 'shield':
        return 'ARMOUR SHIELD';
      case 'rapid':
        return 'RAPID FIRE!';
      case 'bomb':
        return 'EMP BOMB+';
      case 'invuln':
        return '★ INVINCIBLE! ★';
      case 'crystal':
        return '+500 CRYSTAL';
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Flash when about to expire (< 3s)
    if (this.life < 3000 && Math.floor(this.life / 160) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const color = this.getColor();
    const half = this.width / 2;

    // Outer Glowing Aura
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    // Container Octagon / Diamond Hull
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.fillStyle = 'rgba(8, 6, 18, 0.9)';

    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half, 0);
    ctx.lineTo(0, half);
    ctx.lineTo(-half, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Glyph based on type
    ctx.fillStyle = color;
    ctx.shadowBlur = 6;

    switch (this.type) {
      case 'weapon':
        // Triple chevron
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(6, 3);
        ctx.lineTo(0, 0);
        ctx.lineTo(-6, 3);
        ctx.closePath();
        ctx.fill();
        break;

      case 'health':
        // Medical cross
        ctx.fillRect(-2.5, -6.5, 5, 13);
        ctx.fillRect(-6.5, -2.5, 13, 5);
        break;

      case 'shield':
        // Double protective ring
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'rapid':
        // Lightning bolt
        ctx.beginPath();
        ctx.moveTo(1, -7);
        ctx.lineTo(-4, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(-1, 7);
        ctx.lineTo(4, -1);
        ctx.lineTo(0, -1);
        ctx.closePath();
        ctx.fill();
        break;

      case 'bomb':
        // Mini bomb icon
        ctx.beginPath();
        ctx.arc(0, 1.5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1.5, -5, 3, 3);
        ctx.fillStyle = GOLD_ACCENT;
        ctx.fillRect(0, -7, 2, 2);
        break;

      case 'invuln':
        // Shining 4-point star
        ctx.fillStyle = GOLD_ACCENT;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(2, -2);
        ctx.lineTo(7, 0);
        ctx.lineTo(2, 2);
        ctx.lineTo(0, 7);
        ctx.lineTo(-2, 2);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-2, -2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'crystal':
        // Radiant gemstone
        ctx.fillStyle = '#C77DFF';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(5, -2);
        ctx.lineTo(3, 6);
        ctx.lineTo(-3, 6);
        ctx.lineTo(-5, -2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }
}
