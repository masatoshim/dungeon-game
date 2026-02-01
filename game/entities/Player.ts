// game/entities/Player.ts

import * as Phaser from "phaser";
import { WeaponData } from "@/types";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private arcadeBody: Phaser.Physics.Arcade.Body;

  // 現在の装備
  private currentWeapon: WeaponData | null = null;
  private isAttacking: boolean = false;

  // 操作用
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private lastDirection: { x: number; y: number } = { x: 0, y: 1 };
  private attackCallback?: (
    x: number,
    y: number,
    direction: { x: number; y: number },
    currentWeapon: WeaponData,
  ) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_idle");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;

    // 物理設定
    this.arcadeBody.setCollideWorldBounds(true);

    this.setBodySize(20, 20); // Todo: 適切なプレイヤーサイズに
    this.setOffset(6, 6);

    // 入力設定
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  public setOnAttack(
    callback: (
      x: number,
      y: number,
      dir: { x: number; y: number },
      weapon: WeaponData,
    ) => void,
  ) {
    this.attackCallback = callback;
  }

  update() {
    const speed = 80; // Todo: 適切な移動スピードに
    this.arcadeBody.setVelocity(0);

    // 移動入力
    if (this.cursors.left.isDown) {
      this.arcadeBody.setVelocityX(-speed);
      this.lastDirection = { x: -1, y: 0 };
    } else if (this.cursors.right.isDown) {
      this.arcadeBody.setVelocityX(speed);
      this.lastDirection = { x: 1, y: 0 };
    }

    if (this.cursors.up.isDown) {
      this.arcadeBody.setVelocityY(-speed);
      this.lastDirection = { x: 0, y: -1 };
    } else if (this.cursors.down.isDown) {
      this.arcadeBody.setVelocityY(speed);
      this.lastDirection = { x: 0, y: 1 };
    }

    if (this.arcadeBody.velocity.length() > 0) {
      this.arcadeBody.velocity.normalize().scale(speed);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.executeAttack();
    }
  }

  private executeAttack() {
    if (!this.currentWeapon || this.isAttacking) return;

    this.isAttacking = true;

    if (this.attackCallback) {
      this.attackCallback(
        this.x,
        this.y,
        this.lastDirection,
        this.currentWeapon,
      );
    }

    this.scene.time.delayedCall(this.currentWeapon.cooldown, () => {
      this.isAttacking = false;
    });
  }

  public equipWeapon(weapon: WeaponData) {
    this.currentWeapon = weapon;
    console.log(`${weapon.name} を装備した！`);
  }

  public playDamageEffect() {
    if (!this.isTinted) {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => this.clearTint());
    }
  }
}
