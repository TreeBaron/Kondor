import { CustomLevel } from "./CustomLevel.ts";
import { inXSeconds, inXMilliseconds } from "./Helper.ts";
import Phaser, { Scene } from "phaser";

// Text display
export class TextDisplay {
  shouldTypeOutText: boolean = true;
  typeTextDelay: number = 50;
  textToTypeIndex: number = 0;
  typeTextTimer?: Date;
  text: string = "";
  textToWrite: string = "";
  delay?: Date;
  textObject: Phaser.GameObjects.Text;
  destroyed: Boolean = false;
  seconds: number;
  next?: () => void;
  started: Boolean = false;
  image?: Phaser.GameObjects.Image;

  constructor(
    level: CustomLevel,
    textValue: string,
    seconds: number,
    character?: string
  ) {
    const marginTop = 25;
    const marginLeft = 130;
    this.textObject = level.add.text(marginLeft + 25, marginTop, "", {
      fontFamily: "Roboto, Helvetica, comic sans, serif",
      fontSize: "24px",
      backgroundColor: "white",
      color: "#CD2500",
    });
    this.textObject.setScrollFactor(0);
    this.seconds = seconds;
    this.textToWrite = textValue;
    if (!this.shouldTypeOutText === true) {
      this.text = textValue;
    }

    this.image = level.add.image(marginLeft, 80 + marginTop, character || "");
    this.image?.setPosition(this.image.x + this.image.width / 2, this.image.y);

    if (this.image) {
      this.textObject.setPosition(
        this.textObject.x + this.image.x,
        this.textObject.y
      );
    }
    this.image?.setScrollFactor(0);
    this.image?.setVisible(false);

    level.uiElements.push(this.textObject);
    if (this.image) {
      level.uiElements.push(this.image);
    }
  }

  start() {
    this.typeTextTimer = new Date();
    this.typeTextTimer = new Date();
    this.started = true;
    if (this.image) {
      this.image.setVisible(true);
    }
  }

  update() {
    if (!this.started) return;

    if (this.destroyed) {
      if (this.next) {
        const nextThing = this.next;
        this.next = undefined;
        nextThing();
      }
      return;
    }

    if (
      this.shouldTypeOutText &&
      this.textToWrite === this.text &&
      this.delay === undefined
    ) {
      this.delay = inXSeconds(this.seconds);
    }

    if (
      this.shouldTypeOutText &&
      this.textToWrite != this.text &&
      this.typeTextTimer &&
      new Date() > this.typeTextTimer
    ) {
      this.text += this.textToWrite[this.textToTypeIndex];
      this.textToTypeIndex++;
      this.typeTextTimer = inXMilliseconds(this.typeTextDelay);
      this.textObject.setText(this.text);
    }

    if (this.delay && new Date() > this.delay) {
      if (this.text != this.textToWrite) {
        return;
      }

      this.destroyed = true;
      this.textObject.destroy();
      if (this.image) {
        this.image.destroy();
      }
    }
  }
}
