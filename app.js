App = function()
{
    var ship;

    this.load  =function()
    {
        wade.loadImage('images/ship-tux.png');
    };

    this.init = function()
    {
        wade.setMinScreenSize(398,708);
        wade.setMaxScreenSize(1920,1080);

        var sprite = new Sprite('images/ship-tux.png');
        var mousePosition = wade.getMousePosition();
        ship = new SceneObject(sprite, 0, mousePosition.x, mousePosition.y);
        wade.addSceneObject(ship);
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
            bullet.moveTo(shipPosition.x, -500, 600);

            bullet.onMoveComplete = function()
            {
                wade.removeSceneObject(this);
            };
        }
    }, 'fire');

    this.onMouseMove = function(eventData)
    {
        ship.setPosition(eventData.screenPosition.x, eventData.screenPosition.y);
    };
};
