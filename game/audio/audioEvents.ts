export enum AudioEvent {
  UI_HOVER = 'UI_HOVER',
  UI_CLICK = 'UI_CLICK',
  PLAY_CLICK = 'PLAY_CLICK',
  PLAYER_SHOT = 'PLAYER_SHOT',
  MULTI_SHOT = 'MULTI_SHOT',
  AMMO_EMPTY = 'AMMO_EMPTY',
  RELOAD_STARTED = 'RELOAD_STARTED',
  BULLET_WALL_IMPACT = 'BULLET_WALL_IMPACT',
  BULLET_ENEMY_IMPACT = 'BULLET_ENEMY_IMPACT',
  PLAYER_HURT = 'PLAYER_HURT',
  LOW_HEALTH = 'LOW_HEALTH',
  SCORE_AWARDED = 'SCORE_AWARDED',
  POWERUP_PICKUP = 'POWERUP_PICKUP',
  SHIELD_ACTIVATE = 'SHIELD_ACTIVATE',
  LEVEL_UP = 'LEVEL_UP',
  STAGE_CLEAR = 'STAGE_CLEAR',
  BOSS_WARNING = 'BOSS_WARNING',
  VICTORY = 'VICTORY',
  GAME_PAUSED = 'GAME_PAUSED',
  GAME_RESUMED = 'GAME_RESUMED',
  GAME_OVER = 'GAME_OVER',
}

export type SoundEffectName =
  | 'ui-hover'
  | 'ui-click'
  | 'play-punch'
  | 'weapon-fire'
  | 'multi-shot'
  | 'empty-ammo'
  | 'reload'
  | 'bullet-wall-impact'
  | 'bullet-enemy-impact'
  | 'score-ding'
  | 'persona-hurt'
  | 'low-health-warning'
  | 'powerup-pickup'
  | 'shield-activate'
  | 'level-up'
  | 'stage-clear'
  | 'boss-warning'
  | 'victory-fanfare';

export type MusicTrackName =
  | 'menu-theme'
  | 'gameplay-theme'
  | 'boss-theme'
  | 'victory-theme'
  | 'defeat-theme';
