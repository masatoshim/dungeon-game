import { prisma } from "@/lib/prisma";

export type Dungeon = NonNullable<
  Awaited<ReturnType<typeof prisma.dungeon.findUnique>>
>;

export type TileId = string;

export interface MapData {
  tiles: TileId[][];
  // Todo: 将来的に拡張があり得る
}

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
