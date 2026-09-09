export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public color: string;
  public size: number;

  constructor(x: number, y: number, vx: number, vy: number, life: number, color: string, size?: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size || Math.random() * 3 + 1.5;
  }

  update(dt: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= dt;
    this.vx *= 0.96;
    this.vy *= 0.96;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class FloatingScoreText {
  public x: number;
  public y: number;
  public text: string;
  public color: string;
  public life: number;
  public maxLife: number;
  public vy: number;

  constructor(x: number, y: number, text: string, color = '#FF1493', duration = 800) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = duration;
    this.maxLife = duration;
    this.vy = -1.2;
  }

  update(dt: number) {
    this.y += this.vy;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 18px "Orbitron", sans-serif';
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
