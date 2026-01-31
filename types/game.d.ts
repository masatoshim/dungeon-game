export type TileId = string;

export interface TileConfig {
  category: string;
  texture: string;
  frame: number;
  isBreakable?: boolean;
  hp?: number;
  itemType?: string;
  enemyType?: string;
}

export interface WeaponData {
  id: string;
  name: string;
  range: number;
  size: number;
  damage: number;
  cooldown: number;
}

export interface EnemyData {
  id: string;
  name: string;
  hp?: number;
}
