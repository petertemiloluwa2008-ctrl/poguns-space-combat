import {
  PROJECTILE_SPEED,
  PROJECTILE_WIDTH,
  PROJECTILE_HEIGHT,
  PROJECTILE_DAMAGE,
  ENEMY_PROJECTILE_SPEED,
  ENEMY_PROJECTILE_SIZE,
  BRAND_PINK,
  DANGER_RED,
  NEON_WHITE,
} from './constants';

export class Projectile {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public vx: number;
  public vy: number;
  public damage: number;
  public isEnemy: boolean;
  public hitWall = false;
  public color: string;

  constructor(
    x: number,
    y: number,
    isEnemy = false,
    vx = 0,
    vy?: number,
    damage = PROJECTILE_DAMAGE,
    color = BRAND_PINK
  ) {
    this.x = x;
    this.y = y;
    this.isEnemy = isEnemy;
    this.vx = vx;
    this.damage = damage;
    this.color = color;

    if (isEnemy) {
      this.width = ENEMY_PROJECTILE_SIZE;
      this.height = ENEMY_PROJECTILE_SIZE;
      this.vy = vy !== undefined ? vy : ENEMY_PROJECTILE_SPEED;
    } else {
      this.width = PROJECTILE_WIDTH;
      this.height = PROJECTILE_HEIGHT;
      this.vy = vy !== undefined ? vy : -PROJECTILE_SPEED;
    }
  }

  update(dt: number) {
    this.x += this.vx;
    this.y += this.vy;
  }

  checkBoundaryHit(canvasWidth: number, canvasHeight: number): boolean {
    if (!this.isEnemy && this.y <= 0) {
      this.hitWall = true;
      return true;
    }
    if (this.x <= 0 || this.x + this.width >= canvasWidth) {
      this.hitWall = true;
      return true;
    }
    return false;
  }

  isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
    return (
      this.y < -40 ||
      this.y > canvasHeight + 50 ||
      this.x < -40 ||
      this.x > canvasWidth + 40
    );
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
    if (this.isEnemy) {
      // Enemy plasma sphere
      ctx.shadowColor = this.color || DANGER_RED;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.color || DANGER_RED;

      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner intense core
      ctx.fillStyle = '#FFAAA6';
      ctx.beginPath();
      ctx.arc(cx, cy, this.width / 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Player Neon laser bolt with directional trail
      const boltColor = this.color || BRAND_PINK;
      ctx.shadowColor = boltColor;
      ctx.shadowBlur = 12;

      const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(angle);

      const w = this.width;
      const h = this.height;

      // Glow trail behind bolt
      const gradient = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
      gradient.addColorStop(0, 'rgba(255, 20, 147, 0.05)');
      gradient.addColorStop(0.5, boltColor);
      gradient.addColorStop(1, NEON_WHITE);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 3);
      ctx.fill();

      // Bright inner core
      ctx.fillStyle = NEON_WHITE;
      ctx.fillRect(-w / 2 + 1.5, -h / 2 + 2, w - 3, h - 4);
    }
    ctx.restore();
  }
}
