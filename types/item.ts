export interface WeaponData {
  id: string;
  name: string;
  range: number;
  size: number;
  damage: number;
  cooldown: number;
}

export interface Item {
  id: string;
  name: string;
  type: "WEAPON" | "LIGHT" | "KEY" | "CONSUMABLE";
  maxUses?: number;
  remainingUses?: number;
  weaponData?: WeaponData;
  // 特定のカテゴリの壁を壊せるかなどのフラグ
  canBreakWalls?: boolean;
  consumesOnUse?: boolean; // 使用時に消費するか（鍵など）
}

export interface PlayerInventory {
  weapon: Item | null;
  hasLight: boolean;
  keys: number;
  items: Item[];
}
