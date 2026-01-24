export const TILE_CATEGORIES = {
  WALL: 'WALL',
  PLAYER: 'PLAYER',
  GOAL: 'GOAL',
  ITEM: 'ITEM',
  ENEMY: 'ENEMY',
  EMPTY: 'EMPTY',
} as const;

export const TILE_CONFIG = {
  'W':  { category: TILE_CATEGORIES.WALL, texture: 'tileset', frame: 0, isBreakable: false },
  'P':  { category: TILE_CATEGORIES.PLAYER, texture: 'player_idle', frame: 0 },
  'G':  { category: TILE_CATEGORIES.GOAL, texture: 'tileset', frame: 5 },
  ' ':  { category: TILE_CATEGORIES.EMPTY },
  
  // 壁
  'BW1': { 
    category: TILE_CATEGORIES.WALL, 
    texture: 'tileset', 
    frame: 10, 
    isBreakable: true, 
    hp: 1 
  },
  'BW3': { 
    category: TILE_CATEGORIES.WALL, 
    texture: 'tileset', 
    frame: 11, 
    isBreakable: true, 
    hp: 3 
  },

  // アイテム
  'S1': { 
    category: TILE_CATEGORIES.ITEM, 
    type: 'SWORD', 
    texture: 'items', 
    frame: 1, 
    durability: 3, 
    power: 1 
  },

  // 敵
  'E_SLIME': { 
    category: TILE_CATEGORIES.ENEMY,
    type: 'SLIME',
    texture: 'items', 
    frame: 1,
    hp: 2 },
} as const;

export type TileId = keyof typeof TILE_CONFIG;