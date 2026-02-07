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
    texture: "stones",
    frame: 0,
    stoneData: {
      drag: 1000,
    },
  },

  // Todo: 物理演算に不具合があるため、保留
  // 鉄球
  // R2: {
  //   category: TILE_CATEGORIES.STONE,
  //   texture: "stones",
  //   frame: 1,
  //   stoneData: {
  //     drag: 2000,
  //   },
  // },

  // 氷
  R3: {
    category: TILE_CATEGORIES.STONE,
    texture: "stones",
    frame: 2,
    stoneData: {
      drag: 10,
    },
  },

  // ギミック：ボタン
  B1: {
    category: TILE_CATEGORIES.GIMMICK,
    texture: "buttons",
    frame: 0,
    openFrame: 1, // 押された時
  },

  // ギミック：扉
  D1: {
    category: TILE_CATEGORIES.GIMMICK,
    texture: "doors",
    frame: 1,
    openFrame: 0,
  },

  // ギミック：鍵扉
  KD1: {
    category: TILE_CATEGORIES.GIMMICK,
    texture: "doors",
    frame: 3,
    openFrame: 2,
    isLocked: true,
  },

  // アイテム：鍵
  K1: {
    category: TILE_CATEGORIES.ITEM,
    texture: "items",
    frame: 1,
    item: {
      id: "KEY_SILVER",
      name: "銀の鍵",
      type: "KEY",
      consumesOnUse: true,
    },
  },

  // アイテム：武器
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
