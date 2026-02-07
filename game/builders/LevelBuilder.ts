import { TILE_CONFIG, TILE_CATEGORIES, TileConfig } from "@/types";
import { Enemy } from "@/game/entities/Enemy";

interface LevelGroups {
  walls: Phaser.Physics.Arcade.StaticGroup;
  breakableWalls: Phaser.Physics.Arcade.StaticGroup;
  items: Phaser.Physics.Arcade.StaticGroup;
  enemies: Phaser.Physics.Arcade.Group;
  goal: Phaser.Physics.Arcade.StaticGroup;
  movableStones: Phaser.Physics.Arcade.Group;
  onPlayerCreate: (x: number, y: number) => void;
}

export class LevelBuilder {
  private tileSize: number = 32;

  constructor(private scene: Phaser.Scene) {}

  /**
   * マップデータを解析して、各種オブジェクトを生成・グループ化する
   */
  public createLevel(mapData: string[][], groups: LevelGroups) {
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

          case TILE_CATEGORIES.STONE:
            // 石専用の生成メソッドを呼ぶ
            this.createMovableStone(posX, posY, config, groups);
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
            item.setData("config", config);
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
              config.enemyData?.hp || config.hp || 1,
            );
            if (config.enemyData) enemy.setData("enemyData", config.enemyData);

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
  private createWall(
    x: number,
    y: number,
    config: TileConfig,
    groups: LevelGroups,
  ) {
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
    wall.setMass(9999);

    const body = wall.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
  }

  private createMovableStone(
    x: number,
    y: number,
    config: TileConfig,
    groups: LevelGroups,
  ) {
    const stone = this.scene.physics.add.sprite(
      x,
      y,
      config.texture,
      config.frame,
    );

    groups.movableStones.add(stone);
    stone.setPushable(true);
    stone.setMass(1); // プレイヤーより重く設定
    stone.setBounce(0); // 反発を0にして振動を防ぐ
    // stone.setDamping(true); // 挙動不安定
    // stone.setFriction(0, 0); // 挙動不安定
    // stone.setSize(31, 31); // 挙動不安定
    stone.setDrag(config.stoneData?.drag ?? 100);
    // stone.setCircle(16); // 挙動不安定
  }
}
