import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private mapData!: number[][]; // ステージデータ（2次元配列）

  constructor() {
    super('MainScene');
  }

  // Next.jsから渡されたデータを受け取る
  init(data: { mapData: number[][] }) {
    this.mapData = data.mapData;
  }

  create() {
    const tileSize = 32;
    // 受け取ったデータを元にタイルを描画
    this.mapData.forEach((row, y) => {
      row.forEach((tileType, x) => {
        if (tileType === 1) { // 壁
          this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, 0x555555).setOrigin(0);
        } else if (tileType === 3) { // 出口
          this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, 0x00ff00).setOrigin(0);
        }
      });
    });

    // プレイヤーの生成など
    const player = this.add.circle(50, 50, 10, 0xff0000);
    this.physics.add.existing(player);
  }
}