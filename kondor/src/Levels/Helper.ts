export function inXSeconds(seconds) {
  let d = new Date();
  d.setSeconds(d.getSeconds() + seconds);
  return d;
}

export function inXMilliseconds(milliSeconds) {
  let d = new Date();
  d.setMilliseconds(d.getMilliseconds() + milliSeconds);
  return d;
}

export function pixelPerfectCheck(spriteA, spriteB, ctx, alphaThreshold = 1) {
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

  function drawSpriteIntoCanvas(spr) {
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

    const originX = spr.originX ?? spr.origin?.x ?? 0.5;
    const originY = spr.originY ?? spr.origin?.y ?? 0.5;

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
