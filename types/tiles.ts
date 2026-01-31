import { TileConfig } from "./game";

export const TILE_CATEGORIES = {
  EMPTY: "EMPTY",
  WALL: "WALL",
  PLAYER: "PLAYER",
  ENEMY: "ENEMY",
  ITEM: "ITEM",
  GOAL: "GOAL",
} as const;

export const TILE_CONFIG: Record<string, TileConfig> = {
  // プレイヤー
  P: { category: TILE_CATEGORIES.PLAYER, texture: "player_idle", frame: 0 },

  // 壁
  W: { category: TILE_CATEGORIES.WALL, texture: "tileset", frame: 2 },
  G: { category: TILE_CATEGORIES.GOAL, texture: "tileset", frame: 0 },
  BW1: {
    category: TILE_CATEGORIES.WALL,
    texture: "tileset",
    frame: 1,
    isBreakable: true,
    hp: 1,
  },
  BW3: {
    category: TILE_CATEGORIES.WALL,
    texture: "tileset",
    frame: 3,
    isBreakable: true,
    hp: 3,
  },

  // アイテム
  S1: {
    category: TILE_CATEGORIES.ITEM,
    texture: "items",
    frame: 0,
    itemType: "SWORD",
  },

  // 敵
  E1: {
    category: TILE_CATEGORIES.ENEMY,
    texture: "enemies",
    frame: 0,
    enemyType: "E_SLIME",
  },
};
