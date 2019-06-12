App = function()
{
    var ship;
    var nextEnemy;
    var enemyDelay;
    var activeBullets = [];

    this.load  =function()
    {
        wade.loadImage('images/ship-tux.png');
        wade.loadImage('images/ship-apple.png');
        wade.loadImage('images/bullet-open-source.png');
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
        var sprite = new Sprite('images/ship-apple.png');

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

        // will call next enemy
        nextEnemy = setTimeout(wade.app.spawnEnemy, enemyDelay);
    };
};
