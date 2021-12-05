var apples;
var platforms;
var player;
var floor;
var facing = 'right'; // Starting frame for player
var upKey;
var leftKey;
var rightKey;
var enterKey;
var play;
var scoreText;
var score;
var gameoverText;
var winText;
var platform_list1;
var platform_list2;
var list_length;
var timetext;
var time;
var time2;
var apple_amount = 15;
var finalScore;
var localName = 'saves';

class TitleScene extends Phaser.Scene {

    constructor() {
        super({ key: "TitleScene" });
    }

    preload() {
        this.load.image("titlescreen", "assets/titlescreen.png");
        this.load.spritesheet("pressE", "assets/pressEanim.png", { frameWidth: 550, frameHeight: 50 });
    }

    create() {
        // Add titlescreen background
        let bg = this.add.sprite(0, 0, "titlescreen");
        bg.setOrigin(0, 0);

        // Create animated text
        try {
            this.anims.create({
                key: 'blinking',
                frames: this.anims.generateFrameNumbers('pressE', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        } catch (err) { console.log(err); }

        // Add animated text
        let press = this.add.sprite(400, 425, "pressE");
        press.setScale(0.8);
        press.anims.play('blinking', true);

        // Create variables
        enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (enterKey.isDown) {
            this.scene.start('GameScene');
        }
    }
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('char', 'assets/char.png', { frameWidth: 32, frameHeight: 40 });
        this.load.image('platform', 'assets/platform.png');
        this.load.image('platform_start', 'assets/starting_platform.png');
        this.load.image('apple', 'assets/apple.png');
    }

    create() {
        // Initialize variables
        score = 0;
        play = true;

        // Creating background canvas
        this.add.sprite(400, 300, 'background');


        // Creating objects
        apples = this.physics.add.group();
        platforms = this.physics.add.staticGroup();

        // Creating base platform
        platforms.create(400, 575, 'platform_start');

        // Initializing platform coordinates
        platform_list1 = [25, 440, 750, 710, 455, 200, 55, 302, 455, 706, 131, 25, 555, 90, 300, 250, 785, 545, 610, 785];
        platform_list2 = [210, 80, 110, 205, 270, 250, 300, 350, 450, 410, 390, 500, 350, 125, 150, 475, 490, 175, 520, 310];
        list_length = platform_list1.length;

        // Populating playform group
        for (var i = 0; i < list_length; i++) {
            platforms.create(platform_list1[i], platform_list2[i], 'platform').setScale(0.5).refreshBody();
        }

        // Populating apple group 
        for (var j = 0; j < apple_amount; j++) {
            apples.create(platform_list1[j] + Math.floor(Math.random() * 50) - 25, platform_list2[j] - 25, 'apple');
        }

        // Creating character with physics
        player = this.physics.add.sprite(400, 500, 'char').setScale(0.8);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        // Giving animations to the character
        try {
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('char', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'turn',
                frames: [{ key: 'char', frame: 4 }],
                frameRate: 20
            });
            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('char', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        } catch (err) { console.log(err); }

        // Setting up texts
        timetext = this.add.text(200, 10, 'Time: 0', { fontSize: '24px', fill: '#151826' });
        time = this.time.addEvent({ delay: 10000, callback: gameOver, callbackScope: this, loop: false });
        scoreText = this.add.text(10, 10, 'Apples: ' + 0 + '/' + apple_amount, { fontSize: '24px', fill: '#151826' });

        // Setting up keyboard inputs to control the character
        upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Adding collider between floors, apples and player to ensure that there's no overlapping
        this.physics.add.collider(player, floor);
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(apples, platforms);
        // Whenever apples and player collide run function collect*/
        this.physics.add.overlap(player, apples, collect, null, this);
    }

    update() {
        if (play) {
            timetext.setText('Time: ' + Math.round(10 * time.getProgress().toString().substr(0, 4))); // Print timer
            // Creating player movement when keys are pressed
            // Jumping
            if (upKey.isDown && player.body.touching.down) {
                player.setVelocityY(-375);

                // Run left
            } else if (leftKey.isDown) {
                player.setVelocityX(-160);
                player.anims.play('left', true);
                if (facing != 'left') {
                    facing = 'left';
                }

                // Run right
            } else if (rightKey.isDown) {
                player.setVelocityX(160);
                player.anims.play('right', true);
                if (facing != 'right') {
                    facing = 'right';
                }

                // If nothing's pressed, stay still
            } else {
                player.setVelocityX(0);
                player.anims.play(facing);
            }

            // If game has ended
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play(facing);
            gameoverText = this.add.text(800 / 2 - 120, 600 / 2, ' GAME OVER! ', { fontSize: 'bold 32px Garamond', fill: '#fff' });
        }
    }
};

class ScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreScene' });
    }

    /* Init catches the data from function that called it (GameScene)*/
    init(score) {
        console.log('Received score:', score);
        finalScore = score;
    }

    preload() {
        this.load.image("scorescreen", "assets/scorescreen.png");
    }

    create() {
        // Catch old record, send it to console, check if new score is better than the last, if so then write over it
        var highScore = JSON.parse(localStorage.getItem(localName)) == null ? 0 : JSON.parse(localStorage.getItem(localName));
        console.log('The highscore from storage:', highScore)
        highScore = Math.max(finalScore, highScore);
        localStorage.setItem(localName, highScore);

        let bg = this.add.sprite(0, 0, "scorescreen");
        bg.setOrigin(0, 0);

        // Add texts to the scoreboard
        let scoreText = this.add.text(310, 250, "Your score: " + finalScore, { fontSize: '24px', fill: '#151826' });
        let highscoreText = this.add.text(220, 200, "Current highscore: " + highScore, { fontSize: '28px', fill: '#151826' });

        // Capture inputs from ENTER key
        enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (enterKey.isDown) {
            this.scene.start('TitleScene');
        }
    }
};

function collect(player, apple) {
    apple.disableBody(true, true);
    score += 1;
    if (score == apple_amount) {
        // Game is over, hide score and show winning text
        scoreText.setText();
        winText = this.add.text(180, 0, 'All apples collected!', { fontSize: '48px', boundsAlignH: 'center', fill: '#151826' });
        gameOver();
    } else {
        scoreText.setText('Apples: ' + score + '/' + apple_amount);
    }
}

// Game over function that inits when first timer runs out
function gameOver() {
    play = false;
    time = this.time.addEvent({ delay: 3000, callback: nextScene, callbackScope: this, loop: false }); // nextScene inits after this delay
}

// Function to change the scene
function nextScene() {
    this.scene.start('ScoreScene', score); // Send score to scoreboard
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene, ScoreScene],
};

let game = new Phaser.Game(config);
