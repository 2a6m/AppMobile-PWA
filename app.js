App = function()
{
    var ship;
    var nextEnemy;
    var enemyDelay;
    var activeBullets = [];
    var scoreCounter;
    var score;

    this.load  =function()
    {
        wade.loadImage('images/ship-tux.png');
        wade.loadImage('images/ship-cat.png');
        wade.loadImage('images/bullet-open-source.png');
        wade.loadImage('images/bullet-poop.png');
    };

    this.init = function()
    {
        wade.setMinScreenSize(398,708);
        wade.setMaxScreenSize(1920,1080);

        var sprite = new Sprite('images/ship-tux.png');
        var mousePosition = wade.getMousePosition();
        ship = new SceneObject(sprite, 0, mousePosition.x, mousePosition.y);
        wade.addSceneObject(ship);

        // spawn enemies
        enemyDelay = 2000; // set value depending score
        nextEnemy = setTimeout(wade.app.spawnEnemy, enemyDelay);

        // score
        score = 0;
        var scoreSprite = new TextSprite(score.toString(), '32px Verdana', '#f88', 'right');
        scoreCounter = new SceneObject(scoreSprite, 0, wade.getScreenWidth() / 2 - 10, -wade.getScreenHeight() / 2 + 30);
        wade.addSceneObject(scoreCounter);
    };

    wade.setMainLoopCallback(function()
    {
        // code to execute several times per second
        // (time % rate == 0)
        if (wade.isMouseDown())
        {
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
            bullet.moveTo(endX, endY, 200);

            // delete bullet when it's finished moving
            bullet.onMoveComplete = function()
            {
                wade.removeSceneObject(this);
            };

            // schedule next bullet
            this.schedule(1000, 'fire');
        };
        enemy.schedule(500, 'fire');
        // will call next enemy
        nextEnemy = setTimeout(wade.app.spawnEnemy, enemyDelay);
    };
};
