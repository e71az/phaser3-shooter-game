import Phaser from "phaser";
import {
  Player,
  ChaserShip,
  GunShip,
  CarrierShip,
  ScrollingBackground,
} from "../Entities";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    // load images
    // this.load.image("sprBg0", "/src/assets/sprBg0.png");
    // this.load.image("sprBg1", "/src/assets/sprBg1.png");
    this.load.spritesheet("sprExplosion", "/src/assets/sprExplosion.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("sprEnemy0", "/src/assets/sprEnemy0.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image("sprEnemy1", "/src/assets/sprEnemy1.png");
    this.load.spritesheet("sprEnemy2", "/src/assets/sprEnemy2.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image("sprLaserEnemy0", "/src/assets/sprLaserEnemy0.png");
    this.load.image("sprLaserPlayer", "/src/assets/sprLaserPlayer.png");
    this.load.spritesheet("sprPlayer", "/src/assets/sprPlayer.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.audio("sndExplode0", "/src/assets/sndExplode0.wav");
    this.load.audio("sndExplode1", "/src/assets/sndExplode1.wav");
    this.load.audio("sndLaser", "/src/assets/sndLaser.wav");
  }

  create() {
    this.anims.create({
      key: "sprEnemy0",
      frames: this.anims.generateFrameNumbers("sprEnemy0"),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "sprEnemy2",
      frames: this.anims.generateFrameNumbers("sprEnemy2"),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "sprExplosion",
      frames: this.anims.generateFrameNumbers("sprExplosion"),
      frameRate: 20,
      repeat: 0,
    });

    this.anims.create({
      key: "sprPlayer",
      frames: this.anims.generateFrameNumbers("sprPlayer"),
      frameRate: 20,
      repeat: -1,
    });

    this.sfx = {
      explosions: [
        this.sound.add("sndExplode0"),
        this.sound.add("sndExplode1"),
      ],
      laser: this.sound.add("sndLaser"),
    };

    this.backgrounds = [];
    for (let i = 0; i < 5; i++) {
      let keys = ["sprBg0", "sprBg1"];
      let key = keys[Phaser.Math.Between(0, keys.length - 1)];
      let bg = new ScrollingBackground(this, key, i * 10);
      this.backgrounds.push(bg);
    }

    this.player = new Player(
      this,
      this.game.config.width * 0.5,
      this.game.config.height * 0.5,
      "sprPlayer"
    );

    this.keyW = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.W,
      false
    );
    this.keyS = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S,
      false
    );
    this.keyA = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A,
      false
    );
    this.keyD = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D,
      false
    );
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      false
    );

    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();

    this.time.addEvent({
      delay: 750,
      callback: function () {
        let enemy = null;

        if (Phaser.Math.Between(0, 10) >= 3) {
          enemy = new GunShip(
            this,
            Phaser.Math.Between(0, this.game.config.width),
            0
          );
        } else if (Phaser.Math.Between(0, 10) >= 5) {
          if (this.getEnemiesByType("ChaserShip").length < 5) {
            enemy = new ChaserShip(
              this,
              Phaser.Math.Between(0, this.game.config.width),
              0
            );
          }
        } else {
          enemy = new CarrierShip(
            this,
            Phaser.Math.Between(0, this.game.config.width),
            0
          );
        }

        if (enemy !== null) {
          enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
          this.enemies.add(enemy);
        }
      },
      callbackScope: this,
      loop: true,
    });

    let score = 0;
    let scoreText = "";

    scoreText = this.add.text(16, 16, `Score: ${score}`, {
      fontSize: "32px",
      fill: "#fff",
    });

    this.physics.add.collider(
      this.playerLasers,
      this.enemies,
      function (playerLaser, enemy) {
        if (enemy) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }
          enemy.explode(true);
          playerLaser.destroy();

          score += 10;
          scoreText.setText("Score: " + score);
        }
      }
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      function (player, enemy) {
        if (!player.getData("isDead") && !enemy.getData("isDead")) {
          player.explode(false);

          player.onDestroy();

          enemy.explode(true);

          localStorage.setItem("playerScore", score);
        }
      }
    );

    this.physics.add.overlap(
      this.player,
      this.enemyLasers,
      function (player, laser) {
        if (!player.getData("isDead") && !laser.getData("isDead")) {
          player.explode(false);
          player.onDestroy();
          laser.destroy();

          localStorage.setItem("playerScore", score);
        }
      }
    );
  }

  update() {
    if (!this.player.getData("isDead")) {
      this.player.update();
      if (this.keyW.isDown) {
        this.player.moveUp();
      } else if (this.keyS.isDown) {
        this.player.moveDown();
      }
      if (this.keyA.isDown) {
        this.player.moveLeft();
      } else if (this.keyD.isDown) {
        this.player.moveRight();
      }

      if (this.keySpace.isDown) {
        this.player.setData("isShooting", true);
      } else {
        this.player.setData(
          "timerShootTick",
          this.player.getData("timerShootDelay") - 1
        );
        this.player.setData("isShooting", false);
      }
    }

    for (let i = 0; i < this.enemies.getChildren().length; i++) {
      let enemy = this.enemies.getChildren()[i];
      enemy.update();
      if (
        enemy.x < -enemy.displayWidth ||
        enemy.x > this.game.config.width + enemy.displayWidth ||
        enemy.y < -enemy.displayHeight * 4 ||
        enemy.y > this.game.config.height + enemy.displayHeight
      ) {
        if (enemy) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }
          enemy.destroy();
        }
      }
    }

    for (let i = 0; i < this.enemyLasers.getChildren().length; i++) {
      let laser = this.enemyLasers.getChildren()[i];
      laser.update();

      if (
        laser.x < -laser.displayWidth ||
        laser.x > this.game.config.width + laser.displayWidth ||
        laser.y < -laser.displayHeight * 4 ||
        laser.y > this.game.config.height + laser.displayHeight
      ) {
        if (laser) {
          laser.destroy();
        }
      }
    }

    for (let i = 0; i < this.playerLasers.getChildren().length; i++) {
      let laser = this.playerLasers.getChildren()[i];
      laser.update();

      if (
        laser.x < -laser.displayWidth ||
        laser.x > this.game.config.width + laser.displayWidth ||
        laser.y < -laser.displayHeight * 4 ||
        laser.y > this.game.config.height + laser.displayHeight
      ) {
        if (laser) {
          laser.destroy();
        }
      }
    }

    for (let i = 0; i < this.backgrounds.length; i++) {
      this.backgrounds[i].update();
    }
  }
  getEnemiesByType(type) {
    let arr = [];
    for (let i = 0; i < this.enemies.getChildren().length; i++) {
      let enemy = this.enemies.getChildren()[i];
      if (enemy.getData("type") == type) {
        arr.push(enemy);
      }
    }
    return arr;
  }
}
