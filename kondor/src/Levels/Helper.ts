import { Player } from "../GameObjects/player.ts";

export function inXSeconds(seconds: number) {
  let d = new Date();
  d.setSeconds(d.getSeconds() + seconds);
  return d;
}

export function inXMilliseconds(milliSeconds: number) {
  let d = new Date();
  d.setMilliseconds(d.getMilliseconds() + milliSeconds);
  return d;
}

export function pixelPerfectCheck(
  spriteA: Phaser.Physics.Arcade.Sprite,
  spriteB: Phaser.Physics.Arcade.Sprite,
  ctx: any,
  alphaThreshold = 1
) {
  const boundsA = spriteA.getBounds();
  const boundsB = spriteB.getBounds();

  const intersect = Phaser.Geom.Intersects.GetRectangleIntersection(
    boundsA,
    boundsB
  );

  if (intersect.width <= 0 || intersect.height <= 0) return false;

  // round up to avoid fractional width/height
  const w = Math.max(1, Math.ceil(intersect.width));
  const h = Math.max(1, Math.ceil(intersect.height));

  // resize canvas once
  if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
    ctx.canvas.width = w;
    ctx.canvas.height = h;
  }

  // clear canvas once
  ctx.clearRect(0, 0, w, h);

  function drawSpriteIntoCanvas(spr: Phaser.Physics.Arcade.Sprite) {
    const frame = spr.frame;
    const srcImg = frame.source.image;

    const sx = frame.cutX ?? frame.x ?? 0;
    const sy = frame.cutY ?? frame.y ?? 0;
    const sWidth = frame.cutWidth ?? frame.width;
    const sHeight = frame.cutHeight ?? frame.height;

    const tm = spr.getWorldTransformMatrix();
    const dx = tm.tx - intersect.x;
    const dy = tm.ty - intersect.y;

    const realW = frame.realWidth ?? frame.width;
    const realH = frame.realHeight ?? frame.height;
    const dWidth = realW * (tm.scaleX ?? 1);
    const dHeight = realH * (tm.scaleY ?? 1);

    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(tm.rotation ?? 0);
    ctx.scale(spr.flipX ? -1 : 1, spr.flipY ? -1 : 1);

    const originX = spr.originX ?? 0.5;
    const originY = spr.originY ?? 0.5;

    ctx.drawImage(
      srcImg,
      sx,
      sy,
      sWidth,
      sHeight,
      -dWidth * originX,
      -dHeight * originY,
      dWidth,
      dHeight
    );

    ctx.restore();
  }

  drawSpriteIntoCanvas(spriteA);
  const dataA = ctx.getImageData(0, 0, w, h).data;

  ctx.clearRect(0, 0, w, h);
  drawSpriteIntoCanvas(spriteB);
  const dataB = ctx.getImageData(0, 0, w, h).data;

  for (let i = 3; i < dataA.length; i += 4) {
    if (dataA[i] >= alphaThreshold && dataB[i] >= alphaThreshold) {
      return true;
    }
  }

  return false;
}

export function createAsteroid(
  level: any,
  x: number,
  y: number,
  scale: number
) {
  const sprites = ["asteroid1", "asteroid2", "asteroid3"];
  let asteroid = level.asteroids.create(
    x,
    y,
    sprites[Phaser.Math.Between(0, 2)]
  );
  asteroid.setScale(scale);
  asteroid.setBounce(1.0);
  asteroid.setCollideWorldBounds(true);

  // circular collision
  const origWidth = asteroid.width;
  const origHeight = asteroid.height;
  const radius = Math.min(origWidth, origHeight) / 2;
  const offsetX = origWidth / 2 - radius;
  const offsetY = origHeight / 2 - radius;
  asteroid.body.setCircle(radius, offsetX, offsetY);
  const velocityX = Phaser.Math.Between(-200, 200);
  const velocityY = Phaser.Math.Between(-200, 200);
  asteroid.setVelocity(velocityX, velocityY);

  return asteroid;
}

export function getRandomPlanetName() {
  const first = [
    "Mel",
    "Ea",
    "Terr",
    "Drea",
    "Bur",
    "Chrono",
    "Ven",
    "Din",
    "Bin",
  ];
  const second = ["den", "ria", "th", "ting", "king", "d", "r"];
  const third = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "2",
    "",
    " I",
    " II",
    " II",
    " Suprema",
    " Theta",
    " Gamma",
    " Tetra",
  ];

  const parts = Phaser.Math.Between(1, 3);
  let name = first[Phaser.Math.Between(0, first.length - 1)];
  if (parts > 1) {
    name += second[Phaser.Math.Between(0, second.length - 1)];
  }

  if (parts > 2) {
    name += third[Phaser.Math.Between(0, third.length - 1)];
  }

  return name;
}

export function getHillHeight(x: number, smoothness: number = 20.0) {
  const f = (fNumb: number) => {
    return Math.sin(fNumb / 55.0) * 400.0;
  };
  const g = (gNumb: number) => {
    return Math.sin(gNumb / 200.0) * 1600;
  };
  const a = (aNumb: number) => {
    return Math.cos(aNumb / 25.0) * 23.0;
  };

  return (f(x) + g(x) + a(x) * 4 + a(x)) / smoothness + 300.0;
}

export function getScaledWorldView(
  cam: Phaser.Cameras.Scene2D.Camera,
  targetZoom: number
) {
  const scaleFactor = targetZoom / cam.zoom;

  const width = cam.worldView.width / scaleFactor;
  const height = cam.worldView.height / scaleFactor;

  const cx = cam.worldView.centerX;
  const cy = cam.worldView.centerY;

  return new Phaser.Geom.Rectangle(
    cx - width / 2,
    cy - height / 2,
    width,
    height
  );
}
