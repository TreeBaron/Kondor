import { CustomLevel } from "../Levels/CustomLevel";

export class Planet extends Phaser.GameObjects.Sprite {
  name: string = "no name";

  constructor(scene: CustomLevel, x: number, y: number, spriteName: string) {
    super(scene, x, y, spriteName);
    scene.add.existing(this);
  }
}
