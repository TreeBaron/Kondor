export class CustomLevel extends Phaser.Scene {
  uiElements: any[] = [];
  hudCam!: Phaser.Cameras.Scene2D.Camera;

  smartCam(player: Phaser.GameObjects.Sprite, level: CustomLevel): void {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const totalVelocity =
      Math.abs(playerBody.velocity.x) + Math.abs(playerBody.velocity.y);
    const totalVelocityX = Math.abs(playerBody.velocity.x);
    const totalVelocityY = Math.abs(playerBody.velocity.y);
    const zoomDFactor = 600.0;
    const moveDFactor = 150.0;

    // PLAYER CAM OFFSET
    const engageSpeed = 5;
    let desiredOffset = { x: 0, y: 0 };
    if (Math.abs(playerBody.velocity.x) > engageSpeed) {
      desiredOffset.x =
        (level.cameras.main.displayWidth / 4.0) *
        (playerBody.velocity.x > 0 ? -1 : 1);
    } else {
      desiredOffset.x = 0;
    }

    if (Math.abs(playerBody.velocity.y) > engageSpeed) {
      desiredOffset.y =
        (level.cameras.main.displayHeight / 4.0) *
        (playerBody.velocity.y > 0 ? -1 : 1);
    } else {
      desiredOffset.y = 0;
    }

    if (totalVelocityX < 200) {
      desiredOffset.x = 0;
    }

    if (totalVelocityY < 200) {
      desiredOffset.y = 0;
    }

    let currentOffset = level.cameras.main.followOffset;
    let xAdjust = Math.abs(
      Math.abs(currentOffset.x - desiredOffset.x) / moveDFactor
    );
    let yAdjust = Math.abs(
      Math.abs(currentOffset.y - desiredOffset.y) / moveDFactor
    );
    let finalX = 0;
    let finalY = 0;
    if (currentOffset.x > desiredOffset.x) {
      finalX -= xAdjust;
    } else {
      finalX += xAdjust;
    }

    if (currentOffset.y > desiredOffset.y) {
      finalY -= yAdjust;
    } else {
      finalY += yAdjust;
    }

    level.cameras.main.setFollowOffset(
      currentOffset.x + finalX,
      currentOffset.y + finalY
    );

    // ZOOM
    let desiredZoom = 1.0;
    //console.log(totalVelocity);
    if (totalVelocity > 200) {
      desiredZoom = 0.5;
    } else if (totalVelocity > 75) {
      desiredZoom = 1.0;
    } else if (totalVelocity > 25) {
      desiredZoom = 1.5;
    } else {
      desiredZoom = 2.0;
    }

    let actualZoom = this.cameras.main.zoom;
    let zoomAdjust = Math.abs(desiredZoom - actualZoom) / zoomDFactor;
    if (desiredZoom > actualZoom) {
      this.cameras.main.setZoom(actualZoom + zoomAdjust);
    } else {
      this.cameras.main.setZoom(actualZoom - zoomAdjust);
    }
  }
}
