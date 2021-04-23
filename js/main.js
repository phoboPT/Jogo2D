
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth ,
    height: window.innerHeight ,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: true
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var map;
var player;
var diamond;
var cursors;
var groundLayer, coinLayer, spikeLayer,diamondLayer;
var text;
var bomb;
var bombs;
var textGameOver;
var textwin;
var audio_pick;
var audio_Gameover;
var audio_win;
var Coinpick = 0;
var Diamondpick = 0;
var level = 1;
var levelcoin = 30;

function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // tiles in spritesheet
    this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});

    // simple coin image
    this.load.image('coin', 'assets/coinGold.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('spike', 'assets/spike.png');
    this.load.image('diamond', 'assets/diamond.png');
   // this.load.image('spike', 'assets/diamond.png');
    // player animations
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
    this.load.audio("audio_pickup",  "assets/sound/pickup.mp3");
    this.load.audio("audio_gameOver",  "assets/sound/audio_gameOver.mp3");
    //this.load.audio("audio_win",  "assets/sound/victoryff.swf.mp3");
}

function create() {

    // load the map

    map = this.make.tilemap({key: 'map'});

    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);

    // coin image used as tileset
    var coinTiles = map.addTilesetImage('coin');
    // add coins as tiles
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    var spikeTiles = map.addTilesetImage('spike');
    // add coins as tiles
     spikeLayer = map.createDynamicLayer('spike', spikeTiles, 0, 0);
    // the player will collide with this spike
    spikeLayer.setCollisionByExclusion([-1]);


    //diamondLayer.setCollisionByExclusion([-1]);
    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite
    player = this.physics.add.sprite(200, 200, 'player');
    player.setBounce(0.2); // our player will bounce from items
    player.setCollideWorldBounds(true); // don't go out of the map

   for (var i = 0; i < 5; i++) {
        var x = Phaser.Math.Between(0, groundLayer.width);
        diamond = this.physics.add.sprite(x, 0, 'diamond');
        diamond.setBounce(0.2);
        this.physics.add.collider(groundLayer, diamond);
       this.physics.add.collider(diamond, player,collectDiamond,null,this);
        diamond.setCollideWorldBounds(true);
    }






    // small fix to our player images, we resize the physics body object slightly
    player.body.setSize(player.width, player.height-8);
    bombs = this.physics.add.group();
    diamond = this.physics.add.group();
    this.physics.add.collider(bombs, groundLayer);


    // player will collide with the level tiles and Spike
    this.physics.add.collider(groundLayer, player);
    this.physics.add.collider(spikeLayer, player,gameover,null,this);
    this.physics.add.collider(bombs, player,gameover,null,this);


    coinLayer.setTileIndexCallback(17, collectCoin, this);
    audio_pick= this.sound.add('audio_pickup');
    audio_Gameover= this.sound.add('audio_gameOver');


    // when the player overlaps with a tile with index 17, collectCoin
    // will be called
    this.physics.add.overlap(player, coinLayer);



    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });


    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#ccccff');


    // this text will show the score
    text = this.add.text(20, 20, 'Level :'+level+'\n'+'Coins:' +'0'+'|'+levelcoin+'\n'+'Diamond :'+'0'+'|'+level ,{
        fontSize: '30px',
        fill: '0xff0000'
    });
    // fix the text to the camera
    text.setScrollFactor(0);

}



// this function will be called when the player touches a coin
function collectCoin(sprite, tile) {
  audio_pick.play();
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    Coinpick++;
    // add 10 points to the score
    text.setText('Level :'+level+'\n'+'Coins:'+Coinpick+'|'+levelcoin+'\n'+'Diamond :'+Diamondpick+'|'+level);
   // set the text to show the current score
    var x = (player.x <400)? Phaser.Math.Between(400,800): Phaser.Math.Between(0,400);
    var bomb = bombs.create(x,16,'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200,200),20);



}

function collectDiamond(diamond) {
    audio_pick.play();
    diamond.disableBody(true,true);
    Diamondpick++;
    text.setText('Level :'+level+'\n'+'Coins:'+Coinpick+'|'+levelcoin+'\n'+'Diamond :'+Diamondpick+'|'+level);


}


function gameover() {
    audio_Gameover.play();
    player.setTint(0xff0000);

    textGameOver = this.add.text(400, 200, 'GameOver', {
        fontSize: '30px',
        fill: '0xff0000'
    });
    textGameOver.setScrollFactor(0);

   this.physics.pause();
    this.time.addEvent({
        delay: 3000,
        callback: ()=>{
             level =1;
             levelcoin = 30;
             Coinpick = 0;
             Diamondpick = 0;
            this.sys.game.destroy(true);

           game = new Phaser.Game(config);
        }});

}


function update(time, delta) {

    if(Diamondpick >= level && Coinpick >= levelcoin ) {
        player.setTint(0x00FF00);
        var display =level + 1;
        textwin= this.add.text(400, 200, 'Win'+'\n'+'Next Level: '+ display, {
            fontSize: '30px',
            fill: '0xff0000',

        });
        textwin.setScrollFactor(0);
       // audio_win.play();
        this.physics.pause();
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                level++;
                levelcoin = levelcoin+5;
                Coinpick = 0;
                Diamondpick = 0;
                this.sys.game.destroy(true);

                game = new Phaser.Game(config);
            }
        });
    }
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
        player.anims.play('walk', true); // walk left
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
    // jump
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-500);
    }
}