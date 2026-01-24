// game/scenes/MainScene.ts
import * as Phaser from 'phaser';
import { TILE_TYPES, TileType } from '../../types/game';

export class MainScene extends Phaser.Scene {
  private mapData!: TileType[][];
  private tileSize: number = 32;
  private player!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private walls!: Phaser.Physics.Arcade.StaticGroup; // 壁グループ

  constructor() {
    super('MainScene');
  }

  init(data: { mapData: TileType[][] }) {
    this.mapData = data.mapData;
  }

  create() {
    // 1. 物理エンジン用の壁グループを作成
    this.walls = this.physics.add.staticGroup();

    // 2. マップ生成
    this.mapData.forEach((row, y) => {
      row.forEach((tile, x) => {
        const posX = x * this.tileSize + this.tileSize / 2;
        const posY = y * this.tileSize + this.tileSize / 2;

        switch (tile) {
          case TILE_TYPES.WALL:
            // 壁をグループに追加（物理体を持つ）
            const wall = this.add.rectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize, 0x555555).setOrigin(0);
            this.walls.add(wall);
            break;

          case TILE_TYPES.PLAYER:
            this.createPlayer(posX, posY);
            break;

          case TILE_TYPES.GOAL:
            this.add.rectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize, 0x00ff00).setOrigin(0);
            break;
        }
      });
    });

    // 3. 衝突判定の設定 (プレイヤーと壁)
    if (this.player && this.walls) {
      this.physics.add.collider(this.player, this.walls);
    }

    // 4. 入力（矢印キー）の準備
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

// --- create() メソッドの後半部分 ---

    // 1. マップの全体サイズを計算
    const mapWidth = this.mapData[0].length * this.tileSize;
    const mapHeight = this.mapData.length * this.tileSize;
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    // 2. 物理エンジンの境界はマップサイズに合わせる
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // 3. マップが画面より「大きい」か「小さい」かで処理を分ける
    if (mapWidth > screenWidth || mapHeight > screenHeight) {
      // マップが画面より大きい場合：カメラの移動範囲を制限し、プレイヤーを追従
      this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
      if (this.player) {
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      }
    } else {
      // マップが画面より小さい場合：カメラを固定し、中心にオフセットをかける
      const offsetX = (screenWidth - mapWidth) / 2;
      const offsetY = (screenHeight - mapHeight) / 2;
      
      // 重要：setBounds を設定しない、あるいは画面全体に広げる
      this.cameras.main.removeBounds(); 
      this.cameras.main.setScroll(-offsetX, -offsetY);
    }
  }

  private createPlayer(x: number, y: number) {
    this.player = this.add.circle(x, y, 12, 0xff0000) as any;
    this.physics.add.existing(this.player);
    
    // プレイヤーが画面外に出ないようにする
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  update() {
    if (!this.player || !this.cursors) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = 160;

    // 速度を一度リセット
    body.setVelocity(0);

    // 5. 移動ロジック
    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
    }

    // 斜め移動でも速くならないように正規化
    body.velocity.normalize().scale(speed);
  }
}