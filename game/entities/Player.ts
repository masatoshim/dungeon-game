import * as Phaser from 'phaser';
import { WeaponData, WEAPONS } from '@/types';

export class Player extends Phaser.Physics.Arcade.Sprite {

  // 現在の装備
  private currentWeapon: WeaponData | null = null; 
  private isAttacking: boolean = false;
  // 操作用
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private lastDirection: { x: number; y: number } = { x: 0, y: 1 };
  private attackCallback?: (x: number, y: number, direction: { x: number; y: number }, currentWeapon: WeaponData) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');

    // シーンに追加し、物理エンジンを有効化
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 物理設定
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    this.setBodySize(20, 24); // Todo: 適切なサイズに

    // 入力設定
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  // 攻撃時の処理を外部から登録できるようにする
  public setOnAttack(callback: (x: number, y: number, dir: { x: number; y: number }, weapon: WeaponData) => void) {
    this.attackCallback = callback;
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = 120; // Todo: 適切な移動スピードに

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

    // 斜め移動の速度補正
    if (body.velocity.length() > 0) {
      body.velocity.normalize().scale(speed);
    }

    // 攻撃入力
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.executeAttack();
    }
  }

  private executeAttack() {
    if (!this.currentWeapon || this.isAttacking) return;

    this.isAttacking = true;

    if (this.attackCallback) {
      this.attackCallback(this.x, this.y, this.lastDirection, this.currentWeapon);
    }

    this.scene.time.delayedCall(this.currentWeapon.cooldown, () => {
      this.isAttacking = false;
    });
  }

  // 武器を装備
  public equipWeapon(weaponId: string) {
    if (WEAPONS[weaponId]) {
      this.currentWeapon = WEAPONS[weaponId];
      console.log(`${this.currentWeapon.name} を装備した！`);
    }
  }

  // ダメージ演出などはPlayerクラス自身が持つ
  public playDamageEffect() {
    if (!this.isTinted) {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => this.clearTint());
    }
  }

  // 攻撃実行
  public attack() {
    // 武器を持っていない場合は何もしない
    if (!this.currentWeapon) {
      console.log("武器がないので攻撃できません！");
      return;
    }

    if (this.attackCallback) {
      this.attackCallback(this.x, this.y, this.lastDirection, this.currentWeapon);
    }
  }
}