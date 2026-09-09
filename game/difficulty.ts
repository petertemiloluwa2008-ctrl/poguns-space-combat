import { STAGES, StageData } from './constants';
import { EnemyType } from './types';

export interface DifficultyConfig {
  stage: number;
  stageName: string;
  subtitle: string;
  spawnInterval: number;
  speedMultiplier: number;
  allowedTypes: EnemyType[];
  isBossStage: boolean;
}

export function getStageConfig(stageNumber: number): StageData {
  const index = Math.min(STAGES.length - 1, Math.max(0, stageNumber - 1));
  return STAGES[index];
}

export function getDifficultyConfig(stageNumber: number, playerLevel = 1): DifficultyConfig {
  const stageData = getStageConfig(stageNumber);

  // Scale spawn interval with player level for extra challenge
  const levelBonus = Math.min(200, (playerLevel - 1) * 25);
  const spawnInterval = Math.max(350, stageData.spawnInterval - levelBonus);

  // Speed scaling
  const speedMultiplier = stageData.speedMultiplier + (playerLevel - 1) * 0.05;

  return {
    stage: stageData.stageNumber,
    stageName: stageData.name,
    subtitle: stageData.subtitle,
    spawnInterval,
    speedMultiplier,
    allowedTypes: stageData.allowedEnemies as EnemyType[],
    isBossStage: stageData.isBossStage,
  };
}
