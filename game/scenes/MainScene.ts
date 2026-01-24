import * as Phaser from 'phaser';
import { TILE_CONFIG, TILE_CATEGORIES, TileId } from '@/types/game';

export class MainScene extends Phaser.Scene {
  private mapData!: TileId[][];
  private timeLeft: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private tileSize: number = 32;
  
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private breakableWalls!: Phaser.Physics.Arcade.StaticGroup;
  private items!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private goalGroup!: Phaser.Physics.Arcade.StaticGroup;

  private lastDirection: { x: number; y: number } = { x: 0, y: 1 };

  constructor() {
    super('MainScene');
  }

  init(data: { mapData: { tiles: TileId[][] }, timeLimit: number }) {
    console.log("MainScene init data:", data);

    const tiles = data?.mapData?.tiles || (Array.isArray(data?.mapData) ? data.mapData : null);

    if (!tiles) {
      console.error("エラー: マップデータ(tiles)が取得できませんでした。", data);
      this.mapData = [];
      this.timeLeft = 0;
      return;
    }

    this.mapData = data.mapData.tiles;
    this.timeLeft = data.timeLimit ?? 60;
  }

  create() {
    // マップと物理グループの構築
    this.buildMap();
    
    // 衝突・物理挙動の設定
    this.setupPhysics();

    // カメラ設定
    this.setupCamera();

    // 入力設定
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // タイマー開始（1箇所に統合）
    this.startCountdown();
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

  private buildMap() {
    this.walls = this.physics.add.staticGroup();
    this.breakableWalls = this.physics.add.staticGroup();
    this.items = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.goalGroup = this.physics.add.staticGroup();

    this.mapData.forEach((row, y) => {
      row.forEach((tileId, x) => {
        const config = TILE_CONFIG[tileId];
        if (!config || config.category === TILE_CATEGORIES.EMPTY) return;

        const posX = x * this.tileSize + this.tileSize / 2;
        const posY = y * this.tileSize + this.tileSize / 2;

        switch (config.category) {
          case TILE_CATEGORIES.WALL:
            const wall = this.add.sprite(posX, posY, config.texture, config.frame);
            if ('isBreakable' in config && config.isBreakable) {
              this.breakableWalls.add(wall);
              wall.setData('hp', config.hp);
            } else {
              this.walls.add(wall);
            }
            break;

          case TILE_CATEGORIES.PLAYER:
            this.createPlayer(posX, posY);
            break;

          case TILE_CATEGORIES.ITEM:
            const item = this.add.sprite(posX, posY, config.texture, config.frame);
            this.physics.add.existing(item);
            item.setData('config', config);
            this.items.add(item);
            break;

          case TILE_CATEGORIES.ENEMY:
            const enemy = this.enemies.create(posX, posY, config.texture, config.frame);
            enemy.setData('hp', config.hp);
            enemy.setCollideWorldBounds(true);
            break;

          case TILE_CATEGORIES.GOAL:
            const goal = this.add.sprite(posX, posY, config.texture, config.frame);
            this.goalGroup.add(goal);
            break;
        }
      });
    });
  }

  private createPlayer(x: number, y: number) {
    this.player = this.add.circle(x, y, 12, 0xff0000) as any;
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  private setupPhysics() {
    if (!this.player) return;

    // 衝突判定
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.breakableWalls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.breakableWalls);

    // 重なり判定
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerDamage, undefined, this);
    this.physics.add.overlap(this.player, this.goalGroup, this.handleGoal, undefined, this);

    // 敵の徘徊AI
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.enemies.getChildren().forEach((enemy: any) => {
          const dir = Phaser.Math.RND.pick([[-1,0], [1,0], [0,-1], [0,1]]);
          enemy.setVelocity(dir[0] * 50, dir[1] * 50);
        });
      },
      loop: true
    });
  }

  private setupCamera() {
    if (!this.mapData || this.mapData.length === 0 || !this.mapData[0]) {
      return;
    }

    const mapWidth = this.mapData[0].length * this.tileSize;
    const mapHeight = this.mapData.length * this.tileSize;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    if (mapWidth > this.scale.width || mapHeight > this.scale.height) {
      this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    } else {
      this.cameras.main.removeBounds();
      this.cameras.main.setScroll(-(this.scale.width - mapWidth) / 2, -(this.scale.height - mapHeight) / 2);
    }
  }

  private handlePlayerDamage() {
    // 暫定的な演出: 赤く点滅
    if (!this.player.isTinted) {
      this.player.setTint(0xff0000);
      this.time.delayedCall(200, () => this.player.clearTint());
    }
  }

  private handleGoal() {
    // すでにクリア済みなら何もしない
    if (!this.timerEvent || !this.timerEvent.paused) return;

    console.log("GOAL!! クリア！");

    this.timerEvent.remove();

    this.physics.pause();
    this.player.setTint(0x00ff00); // プレイヤーを緑色にする

    // クリアメッセージ（簡易版）
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'STAGE CLEAR!', {
      fontSize: '64px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0); // カメラに追従させない

    // React側にクリアを通知
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

  update() {
    if (!this.player || !this.cursors) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = 160;

    body.setVelocity(0);

    // 移動入力
    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
      this.lastDirection = { x: -1, y: 0 };
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
      this.lastDirection = { x: 1, y: 0 };
    }
    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
      this.lastDirection = { x: 0, y: -1 };
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
      this.lastDirection = { x: 0, y: 1 };
    }

    if (body.velocity.length() > 0) {
      body.velocity.normalize().scale(speed);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attack();
    }
  }

  private attack() {
    const attackX = this.player.x + (this.lastDirection.x * 24);
    const attackY = this.player.y + (this.lastDirection.y * 24);
    
    const hitArea = this.add.rectangle(attackX, attackY, 20, 20, 0xffff00, 0.5);
    this.physics.add.existing(hitArea);

    // 敵への攻撃
    this.physics.overlap(hitArea, this.enemies, (_, enemy) => {
      this.damageObject(enemy as Phaser.GameObjects.Sprite);
    });

    // 壊せる壁への攻撃
    this.physics.overlap(hitArea, this.breakableWalls, (_, wall) => {
      this.damageObject(wall as Phaser.GameObjects.Sprite);
    });

    this.time.delayedCall(100, () => hitArea.destroy());
  }

  private damageObject(target: Phaser.GameObjects.Sprite) {
    const hp = target.getData('hp') - 1;
    if (hp <= 0) {
      target.destroy();
    } else {
      target.setData('hp', hp);
      target.setTint(0xff0000);
      this.time.delayedCall(100, () => target.clearTint());
      // 軽い揺れ演出
      this.tweens.add({ targets: target, x: target.x + 2, duration: 50, yoyo: true });
    }
  }
}