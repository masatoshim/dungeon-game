import { TILE_CONFIG, TILE_CATEGORIES, TileId } from "@/types";
import { Enemy } from "@/game/entities/Enemy";

interface LevelGroups {
  walls: Phaser.Physics.Arcade.StaticGroup;
  breakableWalls: Phaser.Physics.Arcade.StaticGroup;
  items: Phaser.Physics.Arcade.StaticGroup;
  enemies: Phaser.Physics.Arcade.Group;
  goal: Phaser.Physics.Arcade.StaticGroup;
  onPlayerCreate: (x: number, y: number) => void;
}

export class LevelBuilder {
  private tileSize: number = 32;

  constructor(private scene: Phaser.Scene) {}

  /**
   * マップデータを解析して、各種オブジェクトを生成・グループ化する
   */
  public createLevel(mapData: TileId[][], groups: LevelGroups) {
    mapData.forEach((row, y) => {
      row.forEach((tileId, x) => {
        const config = TILE_CONFIG[tileId];

        // 設定がない、または空のタイルならスキップ
        if (!config || config.category === TILE_CATEGORIES.EMPTY) return;

        // タイルの中央座標を計算
        const posX = x * this.tileSize + this.tileSize / 2;
        const posY = y * this.tileSize + this.tileSize / 2;

        switch (config.category) {
          case TILE_CATEGORIES.WALL:
            this.createWall(posX, posY, config, groups);
            break;

          case TILE_CATEGORIES.PLAYER:
            // プレイヤーの初期位置をシーンに報告
            groups.onPlayerCreate(posX, posY);
            break;

          case TILE_CATEGORIES.ITEM:
            const item = this.scene.physics.add.staticSprite(
              posX,
              posY,
              config.texture,
              config.frame,
            );
            if (config.itemType) {
              item.setData("weaponId", config.itemType);
            }
            groups.items.add(item);
            break;

          case TILE_CATEGORIES.ENEMY:
            // Enemyクラスのインスタンスを生成してグループに追加
            const enemy = new Enemy(
              this.scene,
              posX,
              posY,
              config.texture!,
              config.frame || 0,
              config.hp || 1,
            );
            groups.enemies.add(enemy);
            break;

          case TILE_CATEGORIES.GOAL:
            const goal = this.scene.physics.add.staticSprite(
              posX,
              posY,
              config.texture!,
              config.frame || 0,
            );
            groups.goal.add(goal);
            // updateFromGameObject を呼ぶことで、Bodyのサイズが32x32（スプライトサイズ）になる
            goal.body.updateFromGameObject();
            break;
        }
      });
    });
  }

  /**
   * 壁の生成ロジック
   */
  private createWall(x: number, y: number, config: any, groups: LevelGroups) {
    const targetGroup = config.isBreakable
      ? groups.breakableWalls
      : groups.walls;
    const wall = targetGroup.create(
      x,
      y,
      config.texture,
      config.frame,
    ) as Phaser.Physics.Arcade.Sprite;
    if (config.isBreakable) {
      wall.setData("hp", config.hp);
    }
    const body = wall.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
  }
}
