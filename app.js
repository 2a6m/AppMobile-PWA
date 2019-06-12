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

    this.onMouseMove = function(eventData)
    {
        ship.setPosition(eventData.screenPosition.x, eventData.screenPosition.y);
    };
};
