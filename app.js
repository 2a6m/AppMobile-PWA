App = function()
{
    var ship;
    var nextEnemy;
    var enemyDelay;
    var activeBullets = [];
    var scoreCounter;
    var score;
    var fireRate = 2;
    var lastFireTime = 0;

    this.load  =function()
    {
        wade.loadImage('images/ship-tux.png');
        wade.loadImage('images/ship-cat.png');
        wade.loadImage('images/bullet-open-source.png');
        wade.loadImage('images/bullet-poop.png');
        wade.loadImage('images/light-beam.png');
        wade.loadImage('images/crying-cat.png');

        wade.loadAudio('sounds/meow.wav');
    };

    this.init = function()
    {
        wade.setMinScreenSize(398,708);
        wade.setMaxScreenSize(1920,1080);

        // load highscore (connection db)
        var shooterData = wade.retrieveLocalObject('shooterData');
        var highScore = (shooterData && shooterData.highScore) || 0;
        // database
        /*
        this.serverResponse = {};
        var dataToSend = "This is the data I am sending to the server. It's not much.";
        var url = 'http://www.example.com/doSomething.php?' + encodeURIComponent(dataToSend);
        wade.preloadJson(url, this.serverResponse, 0, 1);
        */

        // background
        var width = wade.getScreenWidth();
        var height = wade.getScreenHeight();
        var ratio = width/height;
        // phone
        if (ratio <= 0.4)
        {
            var backSprite = new Sprite('images/galaxy-wallpaper-phone.jpg', 10);
            backSprite.setSize(width, height);
        }
        // tablet
        else if (ratio <= 1.5)
        {
            var backSprite = new Sprite('images/galaxy-wallpaper-tablet.jpg', 10);
            backSprite.setSize(width, height);
        }
        // laptop
        else if (ratio <= 3)
        {
            var backSprite = new Sprite('images/galaxy-wallpaper.jpg', 10);
            backSprite.setSize(width, height);
        }
        else {
            var backSprite = new Sprite('images/galaxy-wallpaper.jpg', 10);
        }
        var backObject = new SceneObject(backSprite);
        wade.addSceneObject(backObject);

        // stars
        // nb star depending width screen
        var value = 20*(width/2000);
        for (var i=0; i<value; i++)
        {
            var size = Math.random() * 150 + 8;
            var rotation = Math.random() * 6.28;
            var posX = (Math.random() - 0.5) * wade.getScreenWidth();
            var posY = (Math.random() - 0.5) * wade.getScreenHeight();
            var starSprite = new Sprite('images/light-beam.png', 10);
            starSprite.setSize(size, size);
            var star = new SceneObject(starSprite, 0, posX, posY);
            star.setRotation(rotation);
            wade.addSceneObject(star);
            star.moveTo(rotation/2 * posX, wade.getScreenHeight() / 2 + size / 2, 20);
            star.onMoveComplete = function()
            {
                var size = this.getSprite().getSize().y;
                var posX = (Math.random() - 0.5) * wade.getScreenWidth();
                this.setPosition(posX, -wade.getScreenHeight() / 2 - size / 2);
                this.moveTo(posX, wade.getScreenHeight() / 2 + size / 2, 20);
            };
        }

        // main menu
        var clickText = new TextSprite('Click or tap to start', '40px Verdana', 'white', 'center');
        clickText.setDrawFunction(wade.drawFunctions.blink_(0.5, 0.5, clickText.draw));
        var clickToStart = new SceneObject(clickText);
        clickToStart.addSprite(new TextSprite('HIGH SCORE', '40px Verdana', '#040000', 'center'), {y: -240});
        clickToStart.addSprite(new TextSprite('ID  |  ' + highScore, '25px Verdana', '#040000', 'center'), {y: -180});
        clickToStart.addSprite(new TextSprite('ID  |  ' + highScore, '25px Verdana', '#040000', 'center'), {y: -150});
        clickToStart.addSprite(new TextSprite('ID  |  ' + highScore, '25px Verdana', '#040000', 'center'), {y: -120});
        clickToStart.addSprite(new TextSprite('ID  |  ' + highScore, '25px Verdana', '#040000', 'center'), {y: -90});
        clickToStart.addSprite(new TextSprite('ID  |  ' + highScore, '25px Verdana', '#040000', 'center'), {y: -60});
        wade.addSceneObject(clickToStart);
        wade.app.onMouseDown = function()
        {
            wade.removeSceneObject(clickToStart);
            wade.app.startGame();
            wade.app.onMouseDown = 0;
        };
    };

    this.startGame = function()
    {
        var sprite = new Sprite('images/ship-tux.png');
        var mousePosition = wade.getMousePosition();
        ship = new SceneObject(sprite, 0, mousePosition.x, mousePosition.y);
        wade.addSceneObject(ship);

        // score counter
        score = 0;
        var scoreSprite = new TextSprite(score.toString(), '32px Verdana', '#b73e67', 'right');
        scoreCounter = new SceneObject(scoreSprite, 0, wade.getScreenWidth() / 2 - 10, -wade.getScreenHeight() / 2 + 30);
        wade.addSceneObject(scoreCounter);

        // spawn enemies
        // enemy spawnrate depend of the score
        enemyDelay = 2000-score;
        nextEnemy = setTimeout(wade.app.spawnEnemy, enemyDelay);

        wade.setMainLoopCallback(function()
        {
            // code to execute several times per second
            // (time % rate == 0)
            var nextFireTime = lastFireTime + 1 / fireRate;
            var time = wade.getAppTime();
            if (wade.isMouseDown() && time >= nextFireTime)
            {
                lastFireTime = time;
                var shipPosition = ship.getPosition();
                var shipSize = ship.getSprite().getSize();
                var sprite = new Sprite('images/bullet-open-source.png');
                var bullet = new SceneObject(sprite, 0, shipPosition.x, shipPosition.y - shipSize.y / 2);
                wade.addSceneObject(bullet);
                activeBullets.push(bullet); // add bullet to array
                bullet.moveTo(shipPosition.x, -500, 600);

                bullet.onMoveComplete = function()
                {
                    wade.removeSceneObject(this);
                    wade.removeObjectFromArray(this, activeBullets);
                };
            }

            // check collision
            for (var i=0; i < activeBullets.length; i++)
            {
                var colliders = activeBullets[i].getOverlappingObjects();
                for (var j=0; j < colliders.length; j++)
                {
                    if (colliders[j].isEnemy)
                    {
                        // explosion
                        var position = colliders[j].getPosition();
                        wade.app.explosion(position);

                        // bug to fix (play no sound)
                        // sound
                        //wade.getAudio('sounds/meow.wav').play();

                        // score
                        score += 10;
                        scoreCounter.getSprite().setText(score);

                        // remove bullet and enemy
                        wade.removeSceneObject(colliders[j]);
                        wade.removeSceneObject(activeBullets[i]);
                        wade.removeObjectFromArrayByIndex(i, activeBullets);
                        break;
                    }
                }
            }
        }, 'fire');

        wade.setMainLoopCallback(function()
        {
            var overlapping = ship.getOverlappingObjects();
            for (var i=0; i < overlapping.length; i++)
            {
                if (overlapping[i].isEnemy || overlapping[i].isEnemyBullet)
                {
                    //explosionSprite
                    wade.app.explosion(ship.getPosition());
                    wade.removeSceneObject(ship);
                    // remove functions
                    wade.setMainLoopCallback(null, 'fire');
                    wade.setMainLoopCallback(null, 'die');

                    // highscore (connection db)
                    var shooterData = wade.retrieveLocalObject('shooterData');
                    var highScore = (shooterData && shooterData.highScore) || 0;

                    // database
                    /*
                    this.serverResponse = {};
                    var object = shooterData;
                    var dataToSend = "This is the data I am sending to the server. It's not much.";
                    var url = 'http://www.example.com/doSomething.php?' + encodeURIComponent(dataToSend);
                    wade.postObject(url, object, this.onServerResponse_());
                    */

                    if (score > highScore)
                    {
                        shooterData = {highScore: score};
                        wade.storeLocalObject('shooterData', shooterData);
                    }

                    // !! here exit game / return to menu !!
                    setTimeout(function()
                    {
                        //wade.clearScene();
                        clearTimeout(nextEnemy);
                        // go back to menu
                        wade.app.endGame();
                    }, 2000);
                }
            }
        }, 'die');

    };

    this.endGame = function()
    {
        var userId = 0;
        var scoreText = new TextSprite('User : ' + userId + ' | Score : ' + score, '40px Verdana', 'white', 'center', 1, 0);
        var scoreObject = new SceneObject(scoreText);
        scoreObject.addSprite(new TextSprite('YOUR SCORE : ', '40px Verdana', '#040000', 'center', 1, 1), {y: -60});
        wade.addSceneObject(scoreObject);
        wade.app.onMouseDown = function()
        {
            wade.clearScene();
            wade.app.onMouseDown = 0;

            //updateUserHighScore(userId, score)

            wade.app.init();
        };
    };

    this.onMouseMove = function(eventData)
    {
        ship.setPosition(eventData.screenPosition.x, eventData.screenPosition.y);
    };

    this.spawnEnemy = function()
    {
        // create a sprite
        var sprite = new Sprite('images/ship-cat.png');

        // calculate start and end coordinates
        var startX = (Math.random() - 0.5) * wade.getScreenWidth();
        var endX = (Math.random() - 0.5) * wade.getScreenWidth();
        var startY = -wade.getScreenHeight() / 2 - sprite.getSize().y / 2;
        var endY = -startY;

        // add the object to the scene and and make it move
        var enemy = new SceneObject(sprite, 0, startX, startY);
        wade.addSceneObject(enemy);
        enemy.isEnemy = true;
        enemy.moveTo(endX, endY, 200);

        // when the enemy is finished moving, delete it
        enemy.onMoveComplete = function()
        {
            wade.removeSceneObject(this);
        };

        enemy.originalStep = enemy.step;
        enemy.step = function()
        {
            this.originalStep();
            // handle rotation here
            var enemyPosition = this.getPosition();
            var playerPosition = ship.getPosition();
            var angle = Math.atan2(playerPosition.y - enemyPosition.y, playerPosition.x - enemyPosition.x) - 3.141 / 2;
            this.setRotation(angle);
        };

        enemy.fire = function()
        {
            var enemySize = this.getSprite().getSize();
            var enemyPosition = this.getPosition();
            var playerPosition = ship.getPosition();

            // calculate direction
            var dx = playerPosition.x - enemyPosition.x;
            var dy = playerPosition.y - enemyPosition.y;
            var length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            // calculate initial and final position for the bullet
            var startX = enemyPosition.x + dx * enemySize.x / 2;
            var startY = enemyPosition.y + dy * enemySize.y / 2;
            var endX = startX + dx * 3000;
            var endY = startY + dy * 3000;

            // create bullet
            var sprite = new Sprite('images/bullet-poop.png');
            var bullet = new SceneObject(sprite, 0, startX, startY);
            wade.addSceneObject(bullet);
            bullet.isEnemyBullet = true;
            bullet.moveTo(endX, endY, 200);

            // delete bullet when it's finished moving
            bullet.onMoveComplete = function()
            {
                wade.removeSceneObject(this);
            };

            // schedule next bullet
            // fire rate depend on the score
            this.schedule(1000/((score+1)/100), 'fire');
        };
        enemy.schedule(500, 'fire');
        // will call next enemy
        nextEnemy = setTimeout(wade.app.spawnEnemy, enemyDelay);
    };

    this.explosion = function(position)
    {
        var animation = new Animation('images/crying-cat.png', 1, 1, 5);
        var explosionSprite = new Sprite();
        explosionSprite.setSize(200, 200);
        explosionSprite.addAnimation('boom', animation);
        var explosion = new SceneObject(explosionSprite, 0, position.x, position.y);
        wade.addSceneObject(explosion);
        explosion.playAnimation('boom');
        explosion.onAnimationEnd = function()
        {
            wade.removeSceneObject(this);
        };
    };
};
