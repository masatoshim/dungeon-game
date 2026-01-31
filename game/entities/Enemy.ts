import * as Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private moveEvent: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: number,
    hp: number,
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setData("hp", hp);
    this.setCollideWorldBounds(true);

    // AI: 2秒ごとに移動方向を変える
    this.moveEvent = scene.time.addEvent({
      delay: 2000,
      callback: this.changeDirection,
      callbackScope: this,
      loop: true,
    });

    this.changeDirection();
  }

  private changeDirection() {
    if (!this.active) return;
    const dir = Phaser.Math.RND.pick([
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]);
    this.setVelocity(dir[0] * 50, dir[1] * 50);
  }

  public takeDamage(amount: number) {
    const hp = this.getData("hp") - amount;
    this.setData("hp", hp);

    if (hp <= 0) {
      this.moveEvent.destroy();
      this.destroy();
    } else {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => this.clearTint());
    }
  }
}
