import { inXSeconds, inXMilliseconds } from "./Helper.ts";

// Text display
export class TextDisplay {
  shouldTypeOutText: boolean = true;
  typeTextDelay: number = 50;
  textToTypeIndex: number = 0;
  typeTextTimer: Date;
  text: string = "";
  textToWrite: string = "";
  delay: Date = inXSeconds(5);
  textObject: Phaser.GameObjects.Text;
  destroyed: Boolean = false;
  seconds: number;
  next?: () => void;
  started: Boolean = false;
  image?: Phaser.GameObjects.Image;

  constructor(
    level: any,
    textValue: string,
    seconds: number,
    character?: string
  ) {
    const marginTop = 25;
    const marginLeft = 130;
    this.textObject = level.add.text(140 + marginLeft + 25, marginTop, "", {
      fontFamily: "Bolshevik, Roboto, Helvetica, serif",
      fontSize: "42px",
      backgroundColor: "white",
      color: "#CD2500",
    });
    this.textObject.setScrollFactor(0);
    this.seconds = seconds;
    this.textToWrite = textValue;
    if (!this.shouldTypeOutText === true) {
      this.text = textValue;
    }

    this.image = level.add.image(70 + marginLeft, 80 + marginTop, character);
    this.image?.setScrollFactor(0);
    this.image?.setVisible(false);
  }

  start() {
    this.typeTextTimer = new Date();
    this.delay = inXSeconds(this.seconds);
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
      this.textToWrite != this.text &&
      new Date() > this.typeTextTimer
    ) {
      this.text += this.textToWrite[this.textToTypeIndex];
      this.textToTypeIndex++;
      this.typeTextTimer = inXMilliseconds(this.typeTextDelay);
      this.textObject.setText(this.text);
    }

    if (new Date() > this.delay) {
      this.destroyed = true;
      this.textObject.destroy();
      if (this.image) {
        this.image.destroy();
      }
    }
  }
}
