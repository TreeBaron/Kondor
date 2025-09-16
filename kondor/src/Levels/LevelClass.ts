export class Level {
  name: string;
  preload: (data?: any) => void;
  create: (data?: any) => void;
  update: (data?: any) => void;
  getConfig: (data?: any) => Phaser.Types.Core.GameConfig;
  data?: any;
}
