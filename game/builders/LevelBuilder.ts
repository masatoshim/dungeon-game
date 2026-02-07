import {
  TILE_CONFIG,
  TILE_CATEGORIES,
  TileConfig,
  EntityData,
  GimmickConnection,
} from "@/types";
import { Enemy } from "@/game/entities/Enemy";

interface LevelGroups {
  walls: Phaser.Physics.Arcade.StaticGroup;
  doors: Phaser.Physics.Arcade.StaticGroup;
  breakableWalls: Phaser.Physics.Arcade.StaticGroup;
  items: Phaser.Physics.Arcade.StaticGroup;
  enemies: Phaser.Physics.Arcade.Group;
  goal: Phaser.Physics.Arcade.StaticGroup;
  movableStones: Phaser.Physics.Arcade.Group;
  onPlayerCreate: (x: number, y: number) => void;
}

export class LevelBuilder {
  private tileSize: number = 32;

  private doorMap = new Map();

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

          case TILE_CATEGORIES.GIMMICK:
            const door = this.scene.physics.add.staticSprite(
              posX,
              posY,
              config.texture,
              config.frame,
            );
            // constants から取得した値をそのまま保存
            if (config.openFrame !== undefined) {
              door.setData("openFrame", config.openFrame);
            }
            if (config.isLocked) {
              door.setData("isLocked", true);
            }
            // 扉をグループに追加（MainSceneから渡されたグループ）
            groups.doors.add(door);
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

  public createGimmicks(
    scene: Phaser.Scene,
    entities: EntityData[] = [], // デフォルト値を空配列に設定して安全にする
    doorGroup: Phaser.Physics.Arcade.StaticGroup,
  ): GimmickConnection[] {
    // entities が undefined の場合に備えたガード処理
    if (!entities || !Array.isArray(entities)) {
      return [];
    }

    const connections: GimmickConnection[] = [];
    this.doorMap.clear();

    // 扉の生成
    entities
      .filter((e) => e.type === "DOOR")
      .forEach((e) => {
        // 優先順位：properties.tileId > e.type(デフォルト)
        const tileId = e.properties?.tileId || "D1";
        const config = TILE_CONFIG[tileId];

        const door = scene.physics.add.staticSprite(
          e.x * 32 + 16,
          e.y * 32 + 16,
          config.texture,
        );

        door.setFrame(config.frame);
        door.setData("id", e.id);
        door.setData("isLocked", config.isLocked); // 鍵扉かどうかのフラグ
        door.setData("openFrame", config.openFrame); // 開いた時のフレーム番号
        door.setData("closedFrame", config.frame); // 閉じている時のフレーム番号

        doorGroup.add(door);
        this.doorMap.set(e.id, door);
      });

    // ボタンの生成
    entities
      .filter((e) => e.type === "BUTTON")
      .forEach((e) => {
        const tileId = e.properties?.tileId || "B1";
        const config = TILE_CONFIG[tileId];

        const button = scene.physics.add.sprite(
          e.x * 32 + 16,
          e.y * 32 + 16,
          config.texture,
        );
        button.setFrame(config.frame);
        button.setImmovable(true);

        if (button.body instanceof Phaser.Physics.Arcade.Body) {
          button.body.setSize(18, 18);
        }

        const targetId = e.properties?.targetId;
        const targetDoor = targetId ? this.doorMap.get(targetId) : null;

        if (targetDoor) {
          connections.push({ button, door: targetDoor });
        }
      });

    // カギの生成（追加）
    entities
      .filter((e) => e.type === "KEY")
      .forEach((e) => {
        const keyItem = scene.physics.add.staticSprite(
          e.x * 32 + 16,
          e.y * 32 + 16,
          "items",
        );
        keyItem.setFrame(1); // 鍵の画像

        // 鍵に「どの扉を開けるか」の情報を埋め込む
        keyItem.setData("config", {
          item: {
            id: e.id,
            name: "カギ",
            type: "KEY",
            targetDoorId: e.properties?.targetId,
          },
        });
        // MainSceneのアイテムグループに追加して拾えるようにする
        (scene as any).items.add(keyItem);
      });

    return connections;
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
