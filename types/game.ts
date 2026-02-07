import { prisma } from "@/lib/prisma";
import { PlayerInventory } from "./item";

export type Dungeon = NonNullable<
  Awaited<ReturnType<typeof prisma.dungeon.findUnique>>
>;

export interface EntityData {
  id: string; // 一意のID（ボタンと扉の紐付け用など）
  type:
    | "ROCK"
    | "IRON_BALL"
    | "ICE"
    | "BUTTON"
    | "DOOR"
    | "KEY"
    | "SWITCH"
    | "LIGHT";
  x: number;
  y: number;
  properties?: {
    // 各ギミック固有の設定
    targetId?: string; // ボタンが操作する扉のID
    tileId?: string;
    useCount?: number; // 使用回数制限
    isLocked?: boolean; // 最初から鍵がかかっているか
  };
}

export interface MapData {
  tiles: string[][];
  entities: EntityData[]; // 動的なオブジェクトはここに集約
  settings: {
    isDark: boolean; // 初期状態が真っ暗かどうか
    ambientLight: number; // 明るさの度合い
  };
}

// ゲームの実行時状態
export interface GameState {
  inventory: PlayerInventory;
  isDark: boolean;
  score: number;
  status: "PLAYING" | "GAMEOVER" | "CLEAR";
}

export interface EnemyData {
  id: string;
  name: string;
  hp?: number;
}

export interface GimmickConnection {
  button: Phaser.Physics.Arcade.Sprite;
  door: Phaser.Physics.Arcade.Sprite;
}

export interface StoneData {
  drag: number; // 空気抵抗・摩擦（ブレーキ）
}
