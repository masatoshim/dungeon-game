import { EnemyData, StoneData } from "./game";
import { WeaponData } from "./item";

export const TILE_CATEGORIES = {
  EMPTY: "EMPTY",
  WALL: "WALL",
  STONE: "STONE",
  PLAYER: "PLAYER",
  ENEMY: "ENEMY",
  ITEM: "ITEM",
  GOAL: "GOAL",
} as const;

export type TileCategory =
  (typeof TILE_CATEGORIES)[keyof typeof TILE_CATEGORIES];

export interface TileConfig {
  category: TileCategory;
  texture: string;
  frame: number;
  isBreakable?: boolean;
  hp?: number;
  enemyData?: EnemyData;
  weaponData?: WeaponData;
  stoneData?: StoneData;
}
