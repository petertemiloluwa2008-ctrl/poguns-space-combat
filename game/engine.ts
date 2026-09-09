import { Player } from './player';
import { Enemy } from './enemies';
import { Projectile } from './projectiles';
import { Particle, FloatingScoreText } from './particles';
import { PowerUp } from './powerups';
import { InputState } from './input';
import { getDifficultyConfig, getStageConfig } from './difficulty';
import { AudioManager } from './audio/AudioManager';
import { AudioEvent } from './audio/audioEvents';
import { ProfileManager } from './profileManager';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BRAND_PINK,
  NEON_CYAN,
  DEEP_PURPLE,
  DANGER_RED,
  GOLD_ACCENT,
  DROP_CHANCE,
  STAGES,
} from './constants';
import { GameState, GameMode, GameStatus, EnemyType, BossState } from './types';
import { ShipId, SHIPS } from './ships';

export { GAME_WIDTH, GAME_HEIGHT };
export type { GameState };

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private fixedDelta = 1000 / 60;

  // Players
  public mode: GameMode = 'solo';
  private player1: Player;
  private player2: Player | null = null;

  private enemies: Enemy[] = [];
  private playerProjectiles: Projectile[] = [];
  private enemyProjectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private powerups: PowerUp[] = [];
  private floatingTexts: FloatingScoreText[] = [];

  // Inputs
  private p1Input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    reload: false,
  };

  private p2Input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    reload: false,
  };

  // Progression
  private currentStage = 1;
  private currentLevel = 1;
  private playerXp = 0;
  private score = 0;
  private highScore = 0;
  private spawnTimer = 0;
  private bossActive = false;
  private finalBoss: Enemy | null = null;

  // Combo System
  private comboStreak = 0;
  private comboMultiplier = 1.0;
  private comboTimer = 0;

  // Screen shake
  private screenShakeIntensity = 0;
  private screenShakeDuration = 0;

  // Starfield
  private stars: Star[] = [];

  public gameState: GameState;
  private onStateChange: (state: GameState) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange: (state: GameState) => void,
    mode: GameMode = 'solo'
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;
    this.mode = mode;

    const profile = ProfileManager.getInstance().getActiveProfile();
    this.highScore = profile.highScore || 0;

    const p1ShipId: ShipId = (profile.selectedShipId as ShipId) || 'vanguard';
    this.player1 = new Player(
      GAME_WIDTH / 2 - (mode === 'coop' ? 60 : 22),
      GAME_HEIGHT - 120,
      'p1',
      p1ShipId
    );

    if (mode === 'coop') {
      this.player2 = new Player(
        GAME_WIDTH / 2 + 20,
        GAME_HEIGHT - 120,
        'p2',
        'phantom'
      );
    }

    this.gameState = this.createDefaultGameState();

    this.boundKeyDown = (e: KeyboardEvent) => this.handleKey(e, true);
    this.boundKeyUp = (e: KeyboardEvent) => this.handleKey(e, false);

    this.initStars();
    this.resizeCanvas();
    this.bindEvents();

    this.syncGameState();
  }

  private createDefaultGameState(): GameState {
    const stageData = getStageConfig(this.currentStage);
    return {
      status: 'start',
      mode: this.mode,
      score: 0,
      highScore: this.highScore,
      playerLevel: 1,
      playerXp: 0,
      xpToNextLevel: 1000,
      stage: this.currentStage,
      maxStages: STAGES.length,
      stageName: stageData.name,
      comboMultiplier: 1.0,
      p1: {
        shipId: this.player1.shipId,
        shipName: this.player1.shipConfig.name,
        health: this.player1.health,
        maxHealth: this.player1.maxHealth,
        ammo: this.player1.ammo,
        maxAmmo: this.player1.maxAmmo,
        reserveAmmo: this.player1.reserveAmmo,
        isReloading: this.player1.isReloading,
        weaponTier: this.player1.weaponTier,
        isShielded: this.player1.shieldTimer > 0,
        shieldTimeRemaining: Math.ceil(this.player1.shieldTimer / 1000),
        isInvincible: this.player1.invulnerabilityPowerTimer > 0,
        invincibleTimeRemaining: Math.ceil(this.player1.invulnerabilityPowerTimer / 1000),
        isRapidFire: this.player1.rapidFireTimer > 0,
        rapidFireTimeRemaining: Math.ceil(this.player1.rapidFireTimer / 1000),
        bombs: this.player1.bombs,
        powerShotProgress: this.player1.powerShotCharge,
        powerShotReady: this.player1.powerShotCharge >= 1,
        isAlive: this.player1.health > 0,
        kills: this.player1.kills,
      },
      p2: this.player2
        ? {
            shipId: this.player2.shipId,
            shipName: this.player2.shipConfig.name,
            health: this.player2.health,
            maxHealth: this.player2.maxHealth,
            ammo: this.player2.ammo,
            maxAmmo: this.player2.maxAmmo,
            reserveAmmo: this.player2.reserveAmmo,
            isReloading: this.player2.isReloading,
            weaponTier: this.player2.weaponTier,
            isShielded: this.player2.shieldTimer > 0,
            shieldTimeRemaining: Math.ceil(this.player2.shieldTimer / 1000),
            isInvincible: this.player2.invulnerabilityPowerTimer > 0,
            invincibleTimeRemaining: Math.ceil(this.player2.invulnerabilityPowerTimer / 1000),
            isRapidFire: this.player2.rapidFireTimer > 0,
            rapidFireTimeRemaining: Math.ceil(this.player2.rapidFireTimer / 1000),
            bombs: this.player2.bombs,
            powerShotProgress: this.player2.powerShotCharge,
            powerShotReady: this.player2.powerShotCharge >= 1,
            isAlive: this.player2.health > 0,
            kills: this.player2.kills,
          }
        : undefined,
      boss: null,
      playerHealth: this.player1.health,
      playerMaxHealth: this.player1.maxHealth,
      ammo: this.player1.ammo,
      maxAmmo: this.player1.maxAmmo,
      reserveAmmo: this.player1.reserveAmmo,
      isReloading: this.player1.isReloading,
      level: 1,
    };
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
    this.resetGame();
    this.syncGameState();
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 110; i++) {
      this.stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
  }

  private resizeCanvas() {
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
  }

  private bindEvents() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  private handleKey(e: KeyboardEvent, pressed: boolean) {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Space',
        'KeyP',
        'KeyR',
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'KeyF',
        'KeyQ',
        'KeyE',
        'KeyB',
        'KeyX',
        'KeyZ',
        'KeyC',
      ].includes(e.code)
    ) {
      e.preventDefault();
    }

    // P1 Controls
    switch (e.code) {
      case 'ArrowUp':
        this.p1Input.up = pressed;
        break;
      case 'ArrowDown':
        this.p1Input.down = pressed;
        break;
      case 'ArrowLeft':
        this.p1Input.left = pressed;
        break;
      case 'ArrowRight':
        this.p1Input.right = pressed;
        break;
      case 'Space':
        this.p1Input.shoot = pressed;
        if (pressed && this.gameState.status === 'playing' && this.player1.powerShotCharge >= 1) {
          this.triggerPowerShot('p1');
        }
        break;
      case 'KeyZ':
      case 'KeyC':
        if (pressed && this.gameState.status === 'playing') {
          this.triggerPowerShot('p1');
        }
        break;
      case 'KeyB':
      case 'KeyX':
        if (pressed && this.gameState.status === 'playing') {
          this.triggerBomb('p1');
        }
        break;
      case 'KeyR':
        this.p1Input.reload = pressed;
        if (pressed && (this.gameState.status === 'gameOver' || this.gameState.status === 'victory')) {
          this.restart();
        }
        break;
      case 'KeyP':
        if (pressed) {
          if (this.gameState.status === 'playing') this.pause();
          else if (this.gameState.status === 'paused') this.resume();
        }
        break;
    }

    // P2 Controls (WASD + Q/E/F)
    if (this.mode === 'coop' && this.player2) {
      switch (e.code) {
        case 'KeyW':
          this.p2Input.up = pressed;
          break;
        case 'KeyS':
          this.p2Input.down = pressed;
          break;
        case 'KeyA':
          this.p2Input.left = pressed;
          break;
        case 'KeyD':
          this.p2Input.right = pressed;
          break;
        case 'KeyF':
          this.p2Input.shoot = pressed;
          break;
        case 'KeyQ':
          if (pressed && this.gameState.status === 'playing') {
            this.triggerPowerShot('p2');
          }
          break;
        case 'KeyE':
          if (pressed && this.gameState.status === 'playing') {
            this.triggerBomb('p2');
          }
          break;
      }
    }
  }

  // --- External Touch & Mobile Controls Bridge ---
  public setTouchInput(input: Partial<InputState>) {
    Object.assign(this.p1Input, input);
  }

  public triggerPowerShot(playerTarget: 'p1' | 'p2' = 'p1'): boolean {
    const player = playerTarget === 'p1' ? this.player1 : this.player2;
    if (!player || player.health <= 0) return false;

    if (player.tryTriggerPowerShot()) {
      this.triggerScreenShake(12, 600);
      this.floatingTexts.push(
        new FloatingScoreText(
          player.x + player.width / 2,
          player.y - 25,
          '⚡ POWER SHOT ACTIVATED! ⚡',
          NEON_CYAN,
          1400
        )
      );
      this.syncGameState();
      return true;
    }
    return false;
  }

  public triggerBomb(playerTarget: 'p1' | 'p2' = 'p1'): boolean {
    const player = playerTarget === 'p1' ? this.player1 : this.player2;
    if (!player || player.health <= 0) return false;

    if (player.tryDeployBomb()) {
      // Screen shake & heavy visual feedback
      this.triggerScreenShake(20, 900);

      // Vaporize all enemy projectiles
      for (const proj of this.enemyProjectiles) {
        this.createHitSparks(proj.x, proj.y, NEON_CYAN);
      }
      this.enemyProjectiles = [];

      // Radial shockwave particles
      const cx = player.x + player.width / 2;
      const cy = player.y + player.height / 2;
      for (let i = 0; i < 45; i++) {
        const angle = (Math.PI * 2 * i) / 45;
        const speed = Math.random() * 8 + 4;
        this.particles.push(
          new Particle(
            cx,
            cy,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            600,
            NEON_CYAN,
            3.5
          )
        );
      }

      // 350 AOE Damage to all on-screen enemies
      const bombDamage = 350;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        enemy.takeDamage(bombDamage);
        this.createHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, BRAND_PINK);
        if (enemy.health <= 0) {
          this.handleEnemyDestruction(enemy, j);
        }
      }

      this.floatingTexts.push(
        new FloatingScoreText(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2 - 20,
          '★ EMP BOMB DETONATION! ★',
          NEON_CYAN,
          2000
        )
      );

      this.syncGameState();
      return true;
    }
    return false;
  }

  public setPlayerShip(shipId: ShipId, playerTarget: 'p1' | 'p2' = 'p1') {
    const player = playerTarget === 'p1' ? this.player1 : this.player2;
    if (player) {
      player.setShip(shipId);
      this.syncGameState();
    }
  }

  public start() {
    AudioManager.getInstance().playEvent(AudioEvent.PLAY_CLICK);
    AudioManager.getInstance().playMusic('gameplay-theme');

    this.gameState.status = 'playing';
    this.resetGame();
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.syncGameState();

    if (!this.animationFrameId) {
      this.loop(this.lastTime);
    }
  }

  public pause() {
    if (this.gameState.status === 'playing') {
      this.gameState.status = 'paused';
      AudioManager.getInstance().playEvent(AudioEvent.GAME_PAUSED);
      this.syncGameState();
    }
  }

  public resume() {
    if (this.gameState.status === 'paused') {
      this.gameState.status = 'playing';
      AudioManager.getInstance().playEvent(AudioEvent.GAME_RESUMED);
      this.lastTime = performance.now();
      this.accumulator = 0;
      this.syncGameState();
    }
  }

  public restart() {
    AudioManager.getInstance().playEvent(AudioEvent.PLAY_CLICK);
    AudioManager.getInstance().playMusic('gameplay-theme');

    this.gameState.status = 'playing';
    this.resetGame();
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.syncGameState();

    if (!this.animationFrameId) {
      this.loop(this.lastTime);
    }
  }

  public goToMainMenu() {
    this.gameState.status = 'start';
    AudioManager.getInstance().playMusic('menu-theme');
    this.resetGame();
    this.syncGameState();
  }

  private resetGame() {
    const profile = ProfileManager.getInstance().getActiveProfile();
    this.highScore = profile.highScore || 0;

    this.enemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.powerups = [];
    this.floatingTexts = [];
    this.score = 0;
    this.currentStage = 1;
    this.currentLevel = 1;
    this.playerXp = 0;
    this.spawnTimer = 0;
    this.bossActive = false;
    this.finalBoss = null;
    this.comboStreak = 0;
    this.comboMultiplier = 1.0;
    this.screenShakeIntensity = 0;

    const p1ShipId: ShipId = (profile.selectedShipId as ShipId) || 'vanguard';
    this.player1 = new Player(
      GAME_WIDTH / 2 - (this.mode === 'coop' ? 60 : 22),
      GAME_HEIGHT - 120,
      'p1',
      p1ShipId
    );

    if (this.mode === 'coop') {
      this.player2 = new Player(
        GAME_WIDTH / 2 + 20,
        GAME_HEIGHT - 120,
        'p2',
        'phantom'
      );
    } else {
      this.player2 = null;
    }
  }

  private loop(currentTime: number) {
    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));

    let delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (delta > 100) delta = 100;
    this.accumulator += delta;

    while (this.accumulator >= this.fixedDelta) {
      if (this.gameState.status === 'playing') {
        this.update(this.fixedDelta);
      }
      this.updateBackground(this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }

    this.render();
  }

  private updateBackground(dt: number) {
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > GAME_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_WIDTH;
      }
    }
  }

  private triggerScreenShake(intensity: number, durationMs: number) {
    this.screenShakeIntensity = intensity;
    this.screenShakeDuration = durationMs;
  }

  private getActivePlayers(): Player[] {
    const list: Player[] = [];
    if (this.player1 && this.player1.health > 0) list.push(this.player1);
    if (this.player2 && this.player2.health > 0) list.push(this.player2);
    return list;
  }

  private checkPowerShotBeamCollisions(player: Player, dt: number) {
    if (!player.isPowerShotActive) return;
    const beamCenterX = player.x + player.width / 2;
    const beamHalfWidth = 26;
    const dps = 550;
    const tickDamage = (dps * dt) / 1000;

    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const enemy = this.enemies[j];
      if (
        enemy.x + enemy.width >= beamCenterX - beamHalfWidth &&
        enemy.x <= beamCenterX + beamHalfWidth &&
        enemy.y + enemy.height >= 0 &&
        enemy.y <= player.y
      ) {
        enemy.takeDamage(tickDamage);
        this.createHitSparks(beamCenterX, enemy.y + enemy.height / 2, '#00F0FF');
        if (enemy.health <= 0) {
          this.handleEnemyDestruction(enemy, j);
        }
      }
    }
  }

  private update(dt: number) {
    const difficulty = getDifficultyConfig(this.currentStage, this.currentLevel);

    // Screen Shake decay
    if (this.screenShakeDuration > 0) {
      this.screenShakeDuration -= dt;
      if (this.screenShakeDuration <= 0) this.screenShakeIntensity = 0;
    }

    // Combo Timer Decay (resets multiplier after 3.5s without hits)
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboStreak = 0;
        this.comboMultiplier = 1.0;
      }
    }

    // 1. Update Players & Auto-shooting
    if (this.player1.health > 0) {
      this.player1.update(dt, this.p1Input, GAME_WIDTH, GAME_HEIGHT, this.particles, this.playerProjectiles);
      this.checkPowerShotBeamCollisions(this.player1, dt);
    }
    if (this.player2 && this.player2.health > 0) {
      this.player2.update(dt, this.p2Input, GAME_WIDTH, GAME_HEIGHT, this.particles, this.playerProjectiles);
      this.checkPowerShotBeamCollisions(this.player2, dt);
    }

    // Check Total Party Wipeout
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 0) {
      this.gameOver();
      return;
    }

    // 2. Stage & Enemy Spawning Logic
    this.updateSpawning(dt, difficulty);

    // 3. Update Player Projectiles & Wall Collisions
    this.playerProjectiles.forEach((p) => p.update(dt));
    for (const p of this.playerProjectiles) {
      if (p.checkBoundaryHit(GAME_WIDTH, GAME_HEIGHT)) {
        AudioManager.getInstance().playEvent(AudioEvent.BULLET_WALL_IMPACT);
        this.createWallSpark(p.x, Math.max(2, p.y));
      }
    }
    this.playerProjectiles = this.playerProjectiles.filter(
      (p) => !p.hitWall && !p.isOffScreen(GAME_WIDTH, GAME_HEIGHT)
    );

    // 4. Update Enemy Projectiles
    this.enemyProjectiles.forEach((p) => p.update(dt));
    this.enemyProjectiles = this.enemyProjectiles.filter(
      (p) => !p.isOffScreen(GAME_WIDTH, GAME_HEIGHT)
    );

    // 5. Update Enemies
    this.enemies.forEach((e) =>
      e.update(dt, activePlayers, this.enemyProjectiles, GAME_WIDTH, (t, x, y) => {
        this.enemies.push(new Enemy(t, x, y, difficulty.speedMultiplier));
      })
    );
    this.enemies = this.enemies.filter((e) => !e.isOffScreen(GAME_HEIGHT));

    // 6. Update Power-Ups
    this.powerups.forEach((p) => p.update(dt));
    this.checkPowerUpCollisions(activePlayers);
    this.powerups = this.powerups.filter((p) => !p.isExpired());

    // 7. Check Bullet & Body Collisions
    this.checkCollisions(activePlayers);

    // 8. Update Particles & Combat Text
    this.particles.forEach((p) => p.update(dt));
    this.particles = this.particles.filter((p) => p.life > 0);

    this.floatingTexts.forEach((ft) => ft.update(dt));
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);

    // 9. Stage Progression & Boss Checks
    this.checkStageProgression();

    // Sync state to UI
    this.syncGameState();
  }

  private updateSpawning(dt: number, difficulty: ReturnType<typeof getDifficultyConfig>) {
    if (difficulty.isBossStage) {
      if (!this.bossActive && !this.finalBoss) {
        this.bossActive = true;
        this.spawnFinalBoss();
      }
    }

    this.spawnTimer += dt;
    if (this.spawnTimer >= difficulty.spawnInterval) {
      this.spawnTimer = 0;
      // In boss battle, limit minion density
      if (!this.finalBoss || this.enemies.length < 5) {
        this.spawnEnemy(difficulty);
      }
    }
  }

  private spawnEnemy(difficulty: ReturnType<typeof getDifficultyConfig>) {
    const types = difficulty.allowedTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (GAME_WIDTH - 90) + 45;
    this.enemies.push(new Enemy(type, x, -55, difficulty.speedMultiplier));
  }

  private spawnFinalBoss() {
    AudioManager.getInstance().playEvent(AudioEvent.BOSS_WARNING);
    AudioManager.getInstance().playMusic('boss-theme');
    this.triggerScreenShake(14, 800);

    this.floatingTexts.push(
      new FloatingScoreText(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 30,
        '⚠ FINAL BOSS DETECTED! ⚠',
        DANGER_RED,
        2200
      )
    );

    const boss = new Enemy('boss', GAME_WIDTH / 2 - 70, -110, 1.0);
    this.finalBoss = boss;
    this.enemies.push(boss);
  }

  private checkPowerUpCollisions(players: Player[]) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pup = this.powerups[i];
      for (const player of players) {
        if (pup.collidesWith(player)) {
          this.applyPowerUp(pup, player);
          this.powerups.splice(i, 1);
          break;
        }
      }
    }
  }

  private applyPowerUp(pup: PowerUp, player: Player) {
    AudioManager.getInstance().playEvent(AudioEvent.POWERUP_PICKUP);

    const cx = player.x + player.width / 2;
    const cy = player.y - 10;

    switch (pup.type) {
      case 'weapon':
        const tier = player.upgradeWeapon();
        const tierMsg = tier === 5 ? '★ OVERDRIVE 7-SHOT! ★' : `WEAPON UPGRADE (T${tier})!`;
        this.floatingTexts.push(new FloatingScoreText(cx, cy, tierMsg, BRAND_PINK, 1200));
        break;

      case 'health':
        player.health = Math.min(player.maxHealth, player.health + 35);
        this.floatingTexts.push(new FloatingScoreText(cx, cy, '+35 HP RESTORED', NEON_CYAN, 1000));
        break;

      case 'shield':
        player.activateShield();
        this.floatingTexts.push(new FloatingScoreText(cx, cy, 'PLASMA SHIELD ON!', '#3A86FF', 1200));
        break;

      case 'rapid':
        player.activateRapidFire();
        this.floatingTexts.push(new FloatingScoreText(cx, cy, '⚡ HYPER RAPID-FIRE! ⚡', '#FFB800', 1200));
        break;

      case 'invuln':
        player.activateInvincibility();
        this.floatingTexts.push(new FloatingScoreText(cx, cy, '★ INVINCIBILITY ACTIVE! ★', GOLD_ACCENT, 1400));
        break;

      case 'bomb':
        player.addBomb();
        this.floatingTexts.push(new FloatingScoreText(cx, cy, '+1 EMP BOMB STOCK!', '#FF0054', 1200));
        break;

      case 'crystal':
        const pts = Math.round(500 * this.comboMultiplier);
        this.addScore(pts, player);
        this.incrementCombo();
        this.floatingTexts.push(new FloatingScoreText(cx, cy, `+${pts} CRYSTAL BONUS!`, GOLD_ACCENT, 1000));
        break;
    }
  }

  private checkCollisions(players: Player[]) {
    // A. Player Projectiles vs Enemies
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const proj = this.playerProjectiles[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (proj.collidesWith(enemy)) {
          enemy.takeDamage(proj.damage);
          this.playerProjectiles.splice(i, 1);

          AudioManager.getInstance().playEvent(AudioEvent.BULLET_ENEMY_IMPACT);
          this.createHitSparks(proj.x, proj.y, enemy.glowColor);

          // Enemy Destroyed
          if (enemy.health <= 0) {
            this.handleEnemyDestruction(enemy, j);
          }
          break;
        }
      }
    }

    // B. Enemy Projectiles vs Players
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      for (const player of players) {
        if (player.collidesWith(proj)) {
          this.enemyProjectiles.splice(i, 1);
          const damaged = player.takeDamage(proj.damage);
          if (damaged) {
            this.triggerScreenShake(7, 300);
            this.createHitSparks(proj.x, proj.y, DANGER_RED);
            this.resetCombo();
          }
          break;
        }
      }
    }

    // C. Enemy Body vs Players
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      for (const player of players) {
        if (player.collidesWith(enemy)) {
          const damaged = player.takeDamage(enemy.damage);
          if (damaged) {
            this.triggerScreenShake(9, 400);
            this.createExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              enemy.glowColor
            );
            this.resetCombo();
          }

          if (enemy.type !== 'boss') {
            this.enemies.splice(i, 1);
          }
          break;
        }
      }
    }
  }

  private handleEnemyDestruction(enemy: Enemy, index: number) {
    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height / 2;

    this.incrementCombo();
    const awarded = Math.round(enemy.score * this.comboMultiplier);
    this.addScore(awarded, this.player1);

    // Stats & XP
    this.player1.kills += 1;
    this.addXP(Math.round(enemy.score * 0.4));

    if (enemy.type === 'boss') {
      this.createBossExplosion(cx, cy);
      this.triggerScreenShake(18, 1200);
      this.finalBoss = null;
      this.enemies.splice(index, 1);
      this.triggerVictory();
      return;
    }

    this.createExplosion(cx, cy, enemy.glowColor);
    this.floatingTexts.push(
      new FloatingScoreText(
        cx,
        cy,
        `+${awarded}${this.comboMultiplier > 1 ? ` (${this.comboMultiplier.toFixed(1)}x)` : ''}`,
        enemy.glowColor
      )
    );

    // Roll for power-up drop
    if (Math.random() < DROP_CHANCE) {
      this.powerups.push(new PowerUp(cx - 13, cy - 13));
    }

    this.enemies.splice(index, 1);
  }

  private incrementCombo() {
    this.comboStreak += 1;
    this.comboTimer = 3500;
    this.comboMultiplier = Math.min(5.0, 1.0 + Math.floor(this.comboStreak / 4) * 0.5);
  }

  private resetCombo() {
    this.comboStreak = 0;
    this.comboMultiplier = 1.0;
    this.comboTimer = 0;
  }

  private addScore(amount: number, player: Player) {
    this.score += amount;
    AudioManager.getInstance().playEvent(AudioEvent.SCORE_AWARDED);

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  private addXP(amount: number) {
    this.playerXp += amount;
    const nextLevelReq = this.currentLevel * 1200;
    if (this.playerXp >= nextLevelReq) {
      this.currentLevel += 1;
      AudioManager.getInstance().playEvent(AudioEvent.LEVEL_UP);
      this.floatingTexts.push(
        new FloatingScoreText(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2 - 50,
          `★ PILOT LEVEL ${this.currentLevel}! ★`,
          BRAND_PINK,
          1800
        )
      );
    }
  }

  private checkStageProgression() {
    const currentStageData = getStageConfig(this.currentStage);

    // Check if stage target reached and not in final boss stage
    if (!currentStageData.isBossStage && this.score >= currentStageData.scoreTarget) {
      if (this.currentStage < STAGES.length) {
        this.currentStage += 1;
        AudioManager.getInstance().playEvent(AudioEvent.STAGE_CLEAR);

        // Stage Clear Rewards: +50 HP auto-repair
        this.player1.health = Math.min(this.player1.maxHealth, this.player1.health + 50);
        if (this.player2) {
          this.player2.health = Math.min(this.player2.maxHealth, this.player2.health + 50);
        }

        const nextData = getStageConfig(this.currentStage);
        this.floatingTexts.push(
          new FloatingScoreText(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 - 40,
            `STAGE ${this.currentStage}: ${nextData.name}!`,
            GOLD_ACCENT,
            2400
          )
        );
      }
    }
  }

  private triggerVictory() {
    this.gameState.status = 'victory';
    AudioManager.getInstance().playEvent(AudioEvent.VICTORY);

    ProfileManager.getInstance().addMatchStats({
      score: this.score,
      kills: this.player1.kills + (this.player2?.kills || 0),
      stageReached: 5,
      bossDefeated: true,
    });

    this.syncGameState();
  }

  private gameOver() {
    this.gameState.status = 'gameOver';
    AudioManager.getInstance().stopMusic();
    AudioManager.getInstance().playEvent(AudioEvent.GAME_OVER);

    ProfileManager.getInstance().addMatchStats({
      score: this.score,
      kills: this.player1.kills + (this.player2?.kills || 0),
      stageReached: this.currentStage,
      bossDefeated: false,
    });

    this.syncGameState();
  }

  private syncGameState() {
    const stageData = getStageConfig(this.currentStage);

    let bossState: BossState | null = null;
    if (this.finalBoss) {
      bossState = {
        active: true,
        name: 'DREADNOUGHT PRIME MATRIX',
        health: this.finalBoss.health,
        maxHealth: this.finalBoss.maxHealth,
        phase: this.finalBoss.bossPhase,
      };
    }

    this.gameState.score = this.score;
    this.gameState.highScore = this.highScore;
    this.gameState.playerLevel = this.currentLevel;
    this.gameState.playerXp = this.playerXp;
    this.gameState.xpToNextLevel = this.currentLevel * 1200;
    this.gameState.stage = this.currentStage;
    this.gameState.stageName = stageData.name;
    this.gameState.comboMultiplier = this.comboMultiplier;
    this.gameState.boss = bossState;

    this.gameState.p1 = {
      shipId: this.player1.shipId,
      shipName: this.player1.shipConfig.name,
      health: Math.max(0, Math.round(this.player1.health)),
      maxHealth: this.player1.maxHealth,
      ammo: this.player1.ammo,
      maxAmmo: this.player1.maxAmmo,
      reserveAmmo: this.player1.reserveAmmo,
      isReloading: this.player1.isReloading,
      weaponTier: this.player1.weaponTier,
      isShielded: this.player1.shieldTimer > 0,
      shieldTimeRemaining: Math.ceil(this.player1.shieldTimer / 1000),
      isInvincible: this.player1.invulnerabilityPowerTimer > 0,
      invincibleTimeRemaining: Math.ceil(this.player1.invulnerabilityPowerTimer / 1000),
      isRapidFire: this.player1.rapidFireTimer > 0,
      rapidFireTimeRemaining: Math.ceil(this.player1.rapidFireTimer / 1000),
      bombs: this.player1.bombs,
      powerShotProgress: this.player1.powerShotCharge,
      powerShotReady: this.player1.powerShotCharge >= 1,
      isAlive: this.player1.health > 0,
      kills: this.player1.kills,
    };

    if (this.player2) {
      this.gameState.p2 = {
        shipId: this.player2.shipId,
        shipName: this.player2.shipConfig.name,
        health: Math.max(0, Math.round(this.player2.health)),
        maxHealth: this.player2.maxHealth,
        ammo: this.player2.ammo,
        maxAmmo: this.player2.maxAmmo,
        reserveAmmo: this.player2.reserveAmmo,
        isReloading: this.player2.isReloading,
        weaponTier: this.player2.weaponTier,
        isShielded: this.player2.shieldTimer > 0,
        shieldTimeRemaining: Math.ceil(this.player2.shieldTimer / 1000),
        isInvincible: this.player2.invulnerabilityPowerTimer > 0,
        invincibleTimeRemaining: Math.ceil(this.player2.invulnerabilityPowerTimer / 1000),
        isRapidFire: this.player2.rapidFireTimer > 0,
        rapidFireTimeRemaining: Math.ceil(this.player2.rapidFireTimer / 1000),
        bombs: this.player2.bombs,
        powerShotProgress: this.player2.powerShotCharge,
        powerShotReady: this.player2.powerShotCharge >= 1,
        isAlive: this.player2.health > 0,
        kills: this.player2.kills,
      };
    }

    // Single-player backward compat
    this.gameState.playerHealth = this.gameState.p1.health;
    this.gameState.playerMaxHealth = this.gameState.p1.maxHealth;
    this.gameState.ammo = this.gameState.p1.ammo;
    this.gameState.maxAmmo = this.gameState.p1.maxAmmo;
    this.gameState.reserveAmmo = this.gameState.p1.reserveAmmo;
    this.gameState.isReloading = this.gameState.p1.isReloading;
    this.gameState.level = this.currentLevel;

    this.onStateChange({ ...this.gameState });
  }

  private createHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 150, color, 1.5)
      );
    }
  }

  private createWallSpark(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI * 0.2 + Math.random() * Math.PI * 0.6;
      const speed = Math.random() * 2 + 1;
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 160, BRAND_PINK, 1.8)
      );
    }
  }

  private createExplosion(x: number, y: number, primaryColor: string) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.2;
      const col = i % 2 === 0 ? primaryColor : BRAND_PINK;
      this.particles.push(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          Math.random() * 320 + 200,
          col,
          Math.random() * 3 + 1.5
        )
      );
    }
  }

  private createBossExplosion(x: number, y: number) {
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      const colors = [BRAND_PINK, NEON_CYAN, GOLD_ACCENT, DANGER_RED, '#FFFFFF'];
      const col = colors[i % colors.length];
      this.particles.push(
        new Particle(
          x + (Math.random() - 0.5) * 60,
          y + (Math.random() - 0.5) * 60,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          Math.random() * 700 + 450,
          col,
          Math.random() * 4.5 + 2
        )
      );
    }
  }

  public render() {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShakeDuration > 0 && this.screenShakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.screenShakeIntensity;
      const sy = (Math.random() - 0.5) * this.screenShakeIntensity;
      ctx.translate(sx, sy);
    }

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.drawNebulaGlow(ctx);
    this.drawStars(ctx);

    if (this.gameState.status === 'start') {
      ctx.restore();
      return;
    }

    // Entities
    this.particles.forEach((p) => p.draw(ctx));
    this.powerups.forEach((p) => p.draw(ctx));
    this.playerProjectiles.forEach((p) => p.draw(ctx));
    this.enemyProjectiles.forEach((p) => p.draw(ctx));
    this.enemies.forEach((e) => e.draw(ctx));

    if (this.player1.health > 0) this.player1.draw(ctx);
    if (this.player2 && this.player2.health > 0) this.player2.draw(ctx);

    this.floatingTexts.forEach((ft) => ft.draw(ctx));

    ctx.restore();
  }

  private drawNebulaGlow(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const grad1 = ctx.createRadialGradient(
      GAME_WIDTH * 0.25,
      GAME_HEIGHT * 0.35,
      50,
      GAME_WIDTH * 0.25,
      GAME_HEIGHT * 0.35,
      420
    );
    grad1.addColorStop(0, 'rgba(124, 58, 237, 0.09)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const grad2 = ctx.createRadialGradient(
      GAME_WIDTH * 0.8,
      GAME_HEIGHT * 0.65,
      80,
      GAME_WIDTH * 0.8,
      GAME_HEIGHT * 0.65,
      460
    );
    grad2.addColorStop(0, 'rgba(255, 20, 147, 0.07)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }

  private drawStars(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const star of this.stars) {
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = star.alpha;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.restore();
  }

  public triggerReload(player: 'p1' | 'p2' = 'p1') {
    if (this.gameState.status === 'playing') {
      if (player === 'p1') this.player1.startReload();
      else if (this.player2) this.player2.startReload();
    }
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
