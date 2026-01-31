import * as Phaser from "phaser";
import { ASSETS, TileId, MapData, WeaponData } from "@/types";
import { Player } from "@/game/entities/Player";
import { Enemy } from "@/game/entities/Enemy";
import { LevelBuilder } from "@/game/builders/LevelBuilder";

export class MainScene extends Phaser.Scene {
  // データ管理
  private tiles!: TileId[][];
  private timeLeft: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private tileSize: number = 32;

  // エンティティ・マネージャー
  private player!: Player;
  private levelBuilder!: LevelBuilder;

  // 物理グループ
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private breakableWalls!: Phaser.Physics.Arcade.StaticGroup;
  private items!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private goalGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super("MainScene");
  }

  /**
   * シーン開始時の初期化
   */
  init(data: { mapData: MapData; timeLimit: number }) {
    this.tiles = data.mapData.tiles; // Todo: mapDataから取得できるプロパティは今後増える可能性がる。
    this.timeLeft = data.timeLimit ?? 60;
    this.levelBuilder = new LevelBuilder(this);
  }
  /**
   * アセットの読み込み
   */
  preload() {
    Object.entries(ASSETS).forEach(([key, path]) => {
      if (key === "tileset" || key === "items") {
        this.load.spritesheet(key, path, { frameWidth: 32, frameHeight: 32 });
      } else {
        this.load.image(key, path);
      }
    });
  }

  /**
   * ゲーム画面の構築
   */
  create() {
    // 各グループの作成
    this.walls = this.physics.add.staticGroup();
    this.breakableWalls = this.physics.add.staticGroup();
    this.items = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.goalGroup = this.physics.add.staticGroup();

    // LevelManagerを使用してマップ配置
    this.levelBuilder.createLevel(this.tiles, {
      walls: this.walls,
      breakableWalls: this.breakableWalls,
      items: this.items,
      enemies: this.enemies,
      goal: this.goalGroup,
      // プレイヤー生成用の関数を渡す
      onPlayerCreate: (x, y) => {
        this.player = new Player(this, x, y);
        this.player.setOnAttack((ax, ay, dir, w) =>
          this.handleAttack(ax, ay, dir, w),
        );
      },
    });

    // アイテム・物理・カメラ・タイマーの設定
    this.setupItemCollisions();
    this.setupPhysics();
    this.setupCamera();
    this.startCountdown();
  }

  private setupPhysics() {
    if (!this.player) return;

    // 衝突判定（Collider）
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.breakableWalls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.breakableWalls);

    // 重なり判定（Overlap）
    this.physics.add.overlap(
      this.player,
      this.enemies,
      () => this.player.playDamageEffect(),
      undefined,
      this,
    );
  }

  private setupCamera() {
    const firstRow = this.tiles[0] || [];
    const mapWidth = firstRow.length * this.tileSize;
    const mapHeight = this.tiles.length * this.tileSize;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    if (mapWidth > this.scale.width || mapHeight > this.scale.height) {
      // プレイヤーの追従（マップが画面より大きい場合のみ有効に機能する）
      this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    } else {
      // マップを画面の中央に
      this.cameras.main.setScroll(
        -(this.scale.width - mapWidth) / 2,
        -(this.scale.height - mapHeight) / 2,
      );
    }
  }

  private startCountdown() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        window.dispatchEvent(
          new CustomEvent("update-time", { detail: this.timeLeft }),
        );
        if (this.timeLeft <= 0) this.handleGameOver("TIME UP!");
      },
      loop: true,
    });
  }

  /**
   * 攻撃ヒット時の判定
   */
  private handleAttack(
    x: number,
    y: number,
    direction: { x: number; y: number },
    weapon?: WeaponData,
  ) {
    // 武器がない場合のデフォルト値、または武器の range を使用
    const range = weapon ? weapon.range : 24;
    const size = weapon ? weapon.size : 20;
    const damage = weapon ? weapon.damage : 1;

    const attackX = x + direction.x * range;
    const attackY = y + direction.y * range;

    const hitArea = this.add.rectangle(
      attackX,
      attackY,
      size,
      size,
      0xffff00,
      0,
    );
    this.physics.add.existing(hitArea);

    this.physics.overlap(hitArea, this.enemies, (_, target) => {
      // Todo: 武器の攻撃力を適用
      if (target instanceof Enemy) target.takeDamage(damage);
    });

    this.physics.overlap(hitArea, this.breakableWalls, (_, wall) => {
      // Todo: 必要に応じてここも武器の攻撃力を渡すように修正
      this.handleObjectDamage(wall as Phaser.GameObjects.Sprite);
    });

    this.time.delayedCall(100, () => hitArea.destroy());
  }

  /**
   * 壁などの汎用ダメージ処理
   */
  private handleObjectDamage(target: Phaser.GameObjects.Sprite) {
    const hp = target.getData("hp") - 1;
    if (hp <= 0) {
      target.destroy();
    } else {
      target.setData("hp", hp);
      target.setTint(0xff0000);
      this.time.delayedCall(100, () => target.clearTint());
      this.tweens.add({
        targets: target,
        x: target.x + 2,
        duration: 50,
        yoyo: true,
      });
    }
  }

  private handleGoal() {
    if (this.timerEvent?.paused) return;
    this.timerEvent!.paused = true;
    this.physics.pause();
    this.player.setTint(0x00ff00);

    // カメラを少しズーム
    this.cameras.main.zoomTo(1.2, 1000, "Power2");

    // クリア演出の実行
    this.showClearUI();

    window.dispatchEvent(
      new CustomEvent("game-clear", {
        detail: { score: this.timeLeft },
      }),
    );
  }

  private showClearUI() {
    const { width, height } = this.scale;

    // Todo: 画像に差し替える
    const container = this.add
      .container(width / 2, height / 2)
      .setScrollFactor(0);

    // テキスト（将来の画像）
    const msg = this.add
      .text(0, -50, "STAGE CLEAR!", {
        fontSize: "64px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const score = this.add
      .text(0, 20, `TIME BONUS: ${this.timeLeft}`, {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([msg, score]);
    container.setScale(0);

    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 800,
      ease: "Back.easeOut",
      delay: 200,
    });
  }

  private handleGameOver(message: string) {
    this.timerEvent?.remove();
    this.physics.pause();
    this.player.setTint(0x555555);
    console.log(message);
  }

  private setupItemCollisions() {
    // player と items グループの接触を監視
    this.physics.add.overlap(
      this.player,
      this.items, // LevelBuilderで作成されたアイテムグループ
      this.handleItemPickup,
      undefined,
      this,
    );
  }

  // アイテムを拾った時の処理
  private handleItemPickup(playerObj: any, itemObj: any) {
    const player = playerObj as Player;
    const item = itemObj as Phaser.Physics.Arcade.Sprite;
    const weaponId = item.getData("weaponId");

    if (weaponId) {
      player.equipWeapon(weaponId);
      item.destroy();
    }
  }

  update() {
    if (this.player) {
      this.player.update();
      this.checkGoalCondition();
    }
  }

  private checkGoalCondition() {
    if (this.timerEvent?.paused) return;

    const goals = this.goalGroup.getChildren() as Phaser.GameObjects.Sprite[];
    for (const goal of goals) {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      const goalBody = goal.body as Phaser.Physics.Arcade.StaticBody;

      const isContained =
        playerBody.left >= goalBody.left &&
        playerBody.right <= goalBody.right &&
        playerBody.top >= goalBody.top &&
        playerBody.bottom <= goalBody.bottom;

      if (isContained) {
        this.handleGoal();
        return;
      }
    }
  }
}
