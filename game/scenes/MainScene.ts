import * as Phaser from 'phaser';
import { ASSETS, TileId } from '@/types'
import { Player } from '@/game/entities/Player';
import { Enemy } from '@/game/entities/Enemy';
import { LevelManager } from '@/game/managers/LevelBuilder';

export class MainScene extends Phaser.Scene {
  // データ管理
  private mapData!: TileId[][];
  private timeLeft: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private tileSize: number = 32;

  // エンティティ・マネージャー
  private player!: Player;
  private levelManager!: LevelManager;

  // 物理グループ
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private breakableWalls!: Phaser.Physics.Arcade.StaticGroup;
  private items!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private goalGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('MainScene');
  }

  /**
   * シーン開始時の初期化
   */
  init(data: { mapData: { tiles: TileId[][] }, timeLimit: number }) {
    this.mapData = data.mapData.tiles;
    this.timeLeft = data.timeLimit ?? 60;
    this.levelManager = new LevelManager(this);
  }

  /**
   * アセットの読み込み
   */
  preload() {
    Object.entries(ASSETS).forEach(([key, path]) => {
      if (key === 'tileset' || key === 'items') {
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
    this.levelManager.createLevel(this.mapData, {
      walls: this.walls,
      breakableWalls: this.breakableWalls,
      items: this.items,
      enemies: this.enemies,
      goal: this.goalGroup,
      // プレイヤー生成用の関数を渡す
      onPlayerCreate: (x, y) => {
        this.player = new Player(this, x, y);
        this.player.setOnAttack((ax, ay, dir) => this.handleAttack(ax, ay, dir));
      }
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
    this.physics.add.overlap(this.player, this.enemies, () => this.player.playDamageEffect(), undefined, this);
    this.physics.add.overlap(this.player, this.goalGroup, this.handleGoal, undefined, this);
  }

  private setupCamera() {
    const mapWidth = this.mapData[0].length * this.tileSize;
    const mapHeight = this.mapData.length * this.tileSize;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    if (mapWidth > this.scale.width || mapHeight > this.scale.height) {
      // プレイヤーの追従（マップが画面より大きい場合のみ有効に機能する）
      this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    } else {
      // マップを画面の中央に
      this.cameras.main.setScroll(-(this.scale.width - mapWidth) / 2, -(this.scale.height - mapHeight) / 2);
    }
  }

  private startCountdown() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        window.dispatchEvent(new CustomEvent('update-time', { detail: this.timeLeft }));
        if (this.timeLeft <= 0) this.handleGameOver("TIME UP!");
      },
      loop: true
    });
  }

  /**
   * 攻撃ヒット時の判定
   */
  private handleAttack(x: number, y: number, direction: { x: number; y: number }, weapon?: any) {
    // 武器がない場合のデフォルト値、または武器の range を使用
    const range = weapon ? weapon.range : 24;
    const size = weapon ? weapon.size : 20;
    const damage = weapon ? weapon.damage : 1;

    const attackX = x + (direction.x * range);
    const attackY = y + (direction.y * range);
    
    const hitArea = this.add.rectangle(attackX, attackY, size, size, 0xffff00, 0);
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
    const hp = target.getData('hp') - 1;
    if (hp <= 0) {
      target.destroy();
    } else {
      target.setData('hp', hp);
      target.setTint(0xff0000);
      this.time.delayedCall(100, () => target.clearTint());
      this.tweens.add({ targets: target, x: target.x + 2, duration: 50, yoyo: true });
    }
  }

  private handleGoal() {
    if (this.timerEvent?.paused) return;
    this.timerEvent!.paused = true;
    this.physics.pause();
    this.player.setTint(0x00ff00);

    window.dispatchEvent(new CustomEvent('game-clear', { 
      detail: { score: this.timeLeft } 
    }));
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
      this
    );
  }

  // アイテムを拾った時の処理
  private handleItemPickup(playerObj: any, itemObj: any) {
    const player = playerObj as Player;
    const item = itemObj as Phaser.Physics.Arcade.Sprite;
    const weaponId = item.getData('weaponId');

    if (weaponId) {
      player.equipWeapon(weaponId);
      item.destroy();
    }
  }

  update() {
    if (this.player) {
      this.player.update();
    }
  }
}