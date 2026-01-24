export const TILE_TYPES = {
  WALL: 'W',
  PLAYER: 'P',
  GOAL: 'G',
  EMPTY: ' ',
  SWORD: 'S',
  BREAKABLE_WALL: 'BW',
} as const;

export type TileType = typeof TILE_TYPES[keyof typeof TILE_TYPES];