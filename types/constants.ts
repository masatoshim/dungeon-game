import { TileConfig, TILE_CATEGORIES } from "./tiles";

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

  // 石
  R1: {
    category: TILE_CATEGORIES.STONE,
    texture: "circle",
    frame: 0,
  },

  // アイテム
  S1: {
    category: TILE_CATEGORIES.ITEM,
    texture: "items",
    frame: 0,
    weaponData: {
      id: "SWORD",
      name: "剣",
      range: 28,
      size: 24,
      damage: 2,
      cooldown: 300,
    },
  },

  // 敵
  E1: {
    category: TILE_CATEGORIES.ENEMY,
    texture: "enemies",
    frame: 0,
    enemyData: { id: "E_SLIME", name: "スライム", hp: 1 },
  },
};
