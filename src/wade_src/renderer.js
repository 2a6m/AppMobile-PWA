function Renderer()
{
    var layers = {};
    var sortedLayers = [];
	var screenWidth = 0;
	var screenHeight = 0;
    var sceneManager = 0;
    var windowMode = 'full';
    var maxWidth = 1920;
    var maxHeight = 1080;
    var minWidth = 0;
    var minHeight = 0;
	var cameraPosition = {x: 0, y: 0, z: 1};
    var imageUsers = {};
    var smoothing = true;
    var rotated = false;
    var lastContainerWidth = 0;
    var lastContainerHeight = 0;

    this._createLayerIfNeeded = function(layerId, renderMode)
    {
        // If the layer doesn't exist, create it
        if (!layers[layerId])
        {
            layers[layerId] = new Layer(layerId, renderMode);
            if (!smoothing)
            {
                layers[layerId].setSmoothing(smoothing);
            }

            // add it to the array of sorted layers, and re-sort it
            sortedLayers.push(layers[layerId]);
            sortedLayers.sort(this._layerSorter);
        }
    };

    this.removeLayer = function(layerId)
    {
        if (!layers[layerId])
        {
            return;
        }
        wade.removeObjectFromArray(layers[layerId], sortedLayers);
        sortedLayers.sort(this._layerSorter);
        layers[layerId].removeCanvas();
        layers[layerId] = null;
    };
    
    this.removeUnusedLayers = function(exceptions)
    {
        for (var i=sortedLayers.length-1; i >=0; i--)
        {
            if (!sortedLayers[i].getSpriteCount() && (!exceptions || exceptions.indexOf(sortedLayers[i].id) == -1))
            {
                this.removeLayer(sortedLayers[i].id);
            }
        }
    };

    this.getActiveLayerIds =  function()
    {
        return wade.cloneArray(sortedLayers);
    };

	this.init = function(_sceneManager)
	{
		// store a pointer to the sceneManager (to send events to it)
		sceneManager = _sceneManager;

		// Calculate screen height and width
        var container = document.getElementById(wade.getContainerName());
        screenWidth = parseInt(container.getAttribute("width"));
        screenHeight = parseInt(container.getAttribute("height"));
	};
	
	this.draw = function(layersToDraw, forceRedraw)
	{
        var i, layer, updateMainStyle;

        // don't draw if we had no simulation steps since the last draw
        if (!sceneManager.getSimulationDirtyState() && !layersToDraw && !forceRedraw)
        {
            return;
        }

        // profiling stuff
        wade.numDrawCalls = 0;
        var printProfileStats = wade.logDrawTime && console['time'] && console['timeEnd'] && Math.random() < 0.02;
        if (printProfileStats)
        {
            console['time']("Draw");
        }

        // handle forced orientation
        var mainCanvas = document.getElementById(wade.getContainerName());
        var forcedOrientation = wade.getForcedOrientation();
        var containerWidth = wade.getContainerWidth();
        var containerHeight = wade.getContainerHeight();
        var previouslyRotated = rotated;
        switch (forcedOrientation)
        {
            case 'landscape':
                if (containerHeight > containerWidth)
                {
                    rotated = !rotated;
                }
                break;
            case 'portrait':
                if (containerWidth > containerHeight)
                {
                    rotated = !rotated;
                }
                break;
            default:
                rotated = false;
        }
        if (rotated != previouslyRotated)
        {
            var transformString = rotated? 'rotateZ(90deg)' : 'translate3d(0, 0, 0)';
            mainCanvas.style['MozTransform'] = transformString;
            mainCanvas.style['msTransform'] = transformString;
            mainCanvas.style['OTransform'] = transformString;
            mainCanvas.style['webkitTransform'] = transformString;
            mainCanvas.style['transform'] = transformString;
        }

		// handle resizing
        var resize = false;
        containerWidth = wade.getContainerWidth();
        containerHeight = wade.getContainerHeight();
        var containerResized = (lastContainerWidth != containerWidth || lastContainerHeight != containerHeight);
        if (containerResized)
        {
            var eventData = {width: containerWidth, height: containerHeight};
            if (!sceneManager.processEvent('onContainerResize', eventData))
            {
                wade.app.onContainerResize && wade.app.onContainerResize(eventData);
            }
        }
        var w, h;
		if (windowMode == 'full')
		{
            // in full window mode, try to match the container size, within the resolution limits
            var oldWidth = screenWidth;
            var oldHeight = screenHeight;
            screenWidth = Math.max(Math.min(containerWidth, maxWidth), minWidth);
            screenHeight = Math.max(Math.min(containerHeight, maxHeight), minHeight);

            // if we're  outside the limits, apply some css scaling
            if (screenWidth > containerWidth || screenHeight > containerHeight)
            {
                if (screenWidth / containerWidth > screenHeight / containerHeight)
                {

                    screenHeight = Math.max(Math.min(Math.min(screenHeight, containerHeight) * screenWidth / containerWidth, maxHeight), minHeight);
                    w = containerWidth + 'px';
                    h = Math.floor(containerWidth * screenHeight / screenWidth) + 'px'; //'auto' would do the same thing, but not in IE
                }
                else
                {
                    screenWidth = Math.max(Math.min(Math.min(screenWidth, containerWidth) * screenHeight / containerHeight, maxWidth), minWidth);
                    w = Math.floor(containerHeight * screenWidth / screenHeight) + 'px'; //'auto'
                    h = containerHeight + 'px';
                }
            }
            else if (screenWidth < containerWidth && screenHeight < containerHeight)
            {
                if (screenWidth / containerWidth > screenHeight / containerHeight)
                {
                    h = Math.floor(containerWidth * screenHeight / screenWidth) + 'px'; //'auto'
                    w = containerWidth + 'px';
                }
                else
                {
                    h = containerHeight + 'px';
                    w = Math.floor(containerHeight * screenWidth / screenHeight) + 'px'; //'auto'
                }
            }
            else
            {
                h = screenHeight+ 'px';
                w = screenWidth + 'px';
            }
            if (oldWidth != screenWidth || oldHeight != screenHeight)
            {
                mainCanvas.setAttribute('width', screenWidth.toString());
                mainCanvas.setAttribute('height', screenHeight.toString());
                sceneManager.onResize(oldWidth, oldHeight, screenWidth, screenHeight);
                resize = true;
            }
		}
        else if (windowMode == 'stretch to fit')
        {
            // stretch mode means that we only resize through css. The number of pixels in the canvas is never changed
            if (containerWidth / screenWidth > containerHeight / screenHeight)
            {
                w = Math.floor(containerHeight * screenWidth / screenHeight) + 'px'; //'auto'
                h = containerWidth + 'px';
            }
            else
            {
                w = containerWidth + 'px';
                h = Math.floor(containerWidth * screenHeight / screenWidth) + 'px'; //'auto'
            }
        }
        else if (windowMode == 'container')
        {
            oldWidth = screenWidth;
            oldHeight = screenHeight;
            screenWidth = mainCanvas.getAttribute('width');
            screenHeight = mainCanvas.getAttribute('height');
            resize = (oldWidth != screenWidth || oldHeight != screenHeight);
            w = screenWidth + 'px';
            h = screenHeight + 'px';
            if (resize)
            {
                updateMainStyle = true;
                sceneManager.onResize(oldWidth, oldHeight, screenWidth, screenHeight);
            }
        }

        // set canvas css style properties
        updateMainStyle = updateMainStyle || (w && h && (w != mainCanvas.style.width || h != mainCanvas.style.height)) || (rotated != previouslyRotated) || (rotated && containerResized);
        if (updateMainStyle)
        {
            mainCanvas.style.width = w;
            mainCanvas.style.height = h;
            if (rotated)
            {
                var style;
                if (forcedOrientation == 'landscape')
                {
                    style = getComputedStyle(mainCanvas);
                    var diffW = (parseInt(style.marginLeft) + parseInt(style.marginRight)) /2;
                    mainCanvas.style.marginLeft = diffW + 'px';
                    mainCanvas.style.marginTop = 'auto';
                }
                else if (forcedOrientation == 'portrait')
                {
                    style = getComputedStyle(mainCanvas);
                    var diffH = (parseInt(style.marginTop) + parseInt(style.marginBottom)) /2;
                    mainCanvas.style.marginTop = diffH + 'px';
                    mainCanvas.style.marginLeft = 'auto';
                }
            }
            else
            {
                mainCanvas.style.margin = 'auto';
            }
        }

        // store container width and height so next time we know if they've changed
        lastContainerHeight = containerHeight;
        lastContainerWidth = containerWidth;

		// determine which canvases need to be drawn (multiple layers could be using the same canvas)
		var canvasesToDraw = {};

		// iterate over all the layers
		for (i=0; i<sortedLayers.length; i++)
		{
            layer = sortedLayers[i];

			// update canvas style
			var r = layer.getResolutionFactor();
            if (r != 1 && w && h && w == h && w == 'auto')
            {
                layer.setCanvasStyleSize(mainCanvas.getAttribute('width') + 'px', mainCanvas.getAttribute('height') + 'px');
            }
            else if (updateMainStyle)
            {
                layer.setCanvasStyleSize(w, h);
            }

            // if the screen has been resized, let the layer objects know about that
            if (resize)
            {
                layer.resize(screenWidth, screenHeight);
            }

            // check if this is actually a layer that we want to draw
            if (layersToDraw && ((typeof(layersToDraw) == 'number' && layersToDraw != layer.id) || (layersToDraw.indexOf && layersToDraw.indexOf(layer.id) == -1)))
            {
                continue;
            }
			var id = layer.getCanvas().id;
			canvasesToDraw[id] = canvasesToDraw[id] || forceRedraw || layer.hasAnythingChanged();
        }

		// iterate again over all the layers and tell them to draw the sprites they contain
		for (i=0; i<sortedLayers.length; i++)
		{
			layer = sortedLayers[i];

			if (canvasesToDraw[layer.getCanvas().id])
			{
				layer.draw(forceRedraw);
			}
		}

		// profiling stuff
        if (printProfileStats)
        {
            console['timeEnd']("Draw");
            console.log('Number of draw calls: ' + wade.numDrawCalls);
        }

        // clear the simulation dirty state in the scene manager
        sceneManager.clearSimulationDirtyState();
	};

	this.addSprite = function(sprite)
	{
        // add the sprite to its layer
        sprite.getLayer().addSprite(sprite);
	};

    this.removeSprite = function(sprite)
    {
        sprite.getLayer().removeSprite(sprite);
    };

    this._layerSorter = function(layerA, layerB)
    {
        return layerB.id - layerA.id;
    };

    this.getLayer = function(layerId, renderMode)
    {
        this._createLayerIfNeeded(layerId, renderMode);
        return layers[layerId];
    };

    this.getLayerSorting = function(layerId)
    {
        return layers[layerId].getSorting();
    };

    this.setLayerSorting = function(layerId, sortingType)
    {
        this._createLayerIfNeeded(layerId);
        layers[layerId].setSorting(sortingType);
    };

    this.setLayerTransform = function(layerId, scaleFactor, translateFactor)
    {
        this._createLayerIfNeeded(layerId);
        layers[layerId].setTransform(scaleFactor, translateFactor);
    };

    this.setLayerResolutionFactor = function(layerId, resolutionFactor)
    {
        this._createLayerIfNeeded(layerId);
        layers[layerId].setResolutionFactor(resolutionFactor);
    };

    this.getLayerResolutionFactor = function(layerId)
    {
        return (layers[layerId] && layers[layerId].getResolutionFactor());
    };

    this.setResolutionFactor = function(resolutionFactor)
    {
        for (var i=0; i<sortedLayers.length; i++)
        {
            sortedLayers[i].setResolutionFactor(resolutionFactor);
        }
    };

    this.setLayerSmoothing = function(layerId, toggle)
    {
        this._createLayerIfNeeded(layerId);
        layers[layerId].setSmoothing(toggle);
    };

    this.getLayerSmoothing = function(layerId)
    {
        return (layers[layerId] && layers[layerId].getSmoothing());
    };

    this.setSmoothing = function(toggle)
    {
        smoothing = toggle;
        for (var i=0; i<sortedLayers.length; i++)
        {
            sortedLayers[i].setSmoothing(smoothing);
        }
    };

    this.getSmoothing = function()
    {
        return smoothing;
    };

    this.getScreenWidth = function()
    {
        return screenWidth;
    };

    this.getScreenHeight = function()
    {
        return screenHeight;
    };

    this.setScreenSize = function(width, height)
    {
        if (width != screenWidth || height != screenHeight)
        {
            screenWidth = width;
            screenHeight = height;
            // iterate over all the layers
            for (var i=0; i<sortedLayers.length; i++)
            {
                // if the screen has been resized, let the layer objects know about that
                sortedLayers[i].resize(screenWidth, screenHeight);
            }
        }
    };

    this.getMaxScreenWidth = function()
    {
        return maxWidth;
    };

    this.getMaxScreenHeight = function()
    {
        return maxHeight;
    };

    this.setMaxScreenSize = function(width, height)
    {
        maxWidth = width;
        maxHeight = height;
        if (screenWidth > maxWidth || screenHeight > maxHeight)
        {
            sceneManager.setSimulationDirtyState();
            this.draw();
        }
    };

    this.getMinScreenWidth = function()
    {
        return minWidth;
    };

    this.getMinScreenHeight = function()
    {
        return minHeight;
    };

    this.setMinScreenSize = function(width, height)
    {
        minWidth = width;
        minHeight = height;
        if (screenWidth < minWidth || screenHeight < minHeight)
        {
            sceneManager.setSimulationDirtyState();
            this.draw();
        }
    };

    this.setCanvasClearing = function(layerId, toggle)
    {
        this._createLayerIfNeeded(layerId);
        layers[layerId].setCanvasClearing(toggle);
    };

    this.setWindowMode = function(mode)
    {
        windowMode = mode;
    };

    this.getWindowMode = function()
    {
        return windowMode;
    };

    this.getCameraPosition = function()
    {
        return {x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z};
    };

    this.setCameraPosition = function(newPosition)
    {
        var oldPosition = cameraPosition;
        cameraPosition = {x: newPosition.x, y: newPosition.y, z: newPosition.z};
        for (var i=0; i<sortedLayers.length; i++)
        {
            sortedLayers[i].onCameraPositionChanged(newPosition);
        }
        var eventData = {oldPosition: oldPosition, newPosition: {x: newPosition.x, y: newPosition.y, z: newPosition.z}};
        if ((oldPosition.x != cameraPosition.x || oldPosition.y != cameraPosition.y || oldPosition.z != cameraPosition.z) && !wade.processEvent('onCameraMove', eventData))
        {
            wade.app && wade.app.onCameraMove && wade.app.onCameraMove(eventData);
        }
    };

    this.worldPositionToScreen = function(layerId, position)
    {
        return this.getLayer(layerId).worldPositionToScreen(position);
    };

    this.worldDirectionToScreen = function(layerId, direction)
    {
        return this.getLayer(layerId).worldDirectionToScreen(direction);
    };

    this.worldBoxToScreen = function(layerId, box)
    {
        return this.getLayer(layerId).worldBoxToScreen(box);
    };

    this.worldUnitToScreen = function(layerId)
    {
        return this.getLayer(layerId).worldUnitToScreen();
    };

    this.screenPositionToWorld = function(layerId, position)
    {
        return this.getLayer(layerId).screenPositionToWorld(position)
    };

    this.screenDirectionToWorld = function(layerId, direction)
    {
        return this.getLayer(layerId).screenDirectionToWorld(direction);
    };

    this.screenUnitToWorld = function(layerId)
    {
        return  this.getLayer(layerId).screenUnitToWorld();
    };

    this.screenBoxToWorld = function(layerId, box)
    {
        return this.getLayer(layerId).screenBoxToWorld(box);
    };

    this.worldPositionToCanvas = function(layerId, position)
    {
        return this.getLayer(layerId).worldPositionToCanvas(position);
    };

    this.worldDirectionToCanvas = function(layerId, direction)
    {
        return this.getLayer(layerId).worldDirectionToCanvas(direction);
    };

    this.worldBoxToCanvas = function(layerId, box)
    {
        return this.getLayer(layerId).worldBoxToCanvas(box);
    };

    this.worldUnitToCanvas = function(layerId)
    {
        return this.getLayer(layerId).worldUnitToCanvas();
    };

    this.canvasPositionToWorld = function(layerId, position)
    {
        return this.getLayer(layerId).canvasPositionToWorld(position)
    };

    this.canvasDirectionToWorld = function(layerId, direction)
    {
        return this.getLayer(layerId).canvasDirectionToWorld(direction);
    };

    this.canvasUnitToWorld = function(layerId)
    {
        return  this.getLayer(layerId).canvasUnitToWorld();
    };

    this.canvasBoxToWorld = function(layerId, box)
    {
        return this.getLayer(layerId).canvasBoxToWorld(box);
    };

    this.removeCanvases = function()
    {
        for (var i=0; i<sortedLayers.length; i++)
        {
            sortedLayers[i].removeCanvas();
        }
    };

    this.getNumExistingLayers = function()
    {
        return sortedLayers.length;
    };

    this.recreateCanvases = function()
    {
        for (var i=0; i<sortedLayers.length; i++)
        {
            sortedLayers[i].initCanvas();
        }
    };

    this.enableDoubleBuffering = function(toggle)
    {
        var i;
        if (toggle)
        {
            for (i=0; i<sortedLayers.length; i++)
            {
                sortedLayers[i].createSecondaryCanvas();
            }
        }
        else
        {
            for (i=0; i<sortedLayers.length; i++)
            {
                sortedLayers[i].removeSecondaryCanvas();
            }
        }
    };

    this.isScreenRotated = function()
    {
        return rotated;
    };

    this.addSpritesInAreaToArray = function(area, array, layerId, sorted)
    {
        if (typeof(layerId) != "undefined")
        {
            layers[layerId] && layers[layerId].addSpritesInAreaToArray(area, array, sorted);
        }
        else
        {
            for (var i=0; i<sortedLayers.length; i++)
            {
                sortedLayers[i].addSpritesInAreaToArray(area, array, sorted);
            }
        }
    };

    this.addObjectsInAreaToArray = function(area, array, layerId)
    {
        var sprites = [];
        this.addSpritesInAreaToArray(area, sprites, layerId);
        for (var j=0; j<sprites.length; j++)
        {
            var obj = sprites[j].getSceneObject();
            (array.lastIndexOf(obj) == -1) && array.push(obj);
        }
    };

    this.addSpritesInScreenAreaToArray = function(area, array, sorted)
    {
        for (var i=0; i<sortedLayers.length; i++)
        {
            var worldArea = wade.screenBoxToWorld(sortedLayers[i].id, area);
            sortedLayers[i].addSpritesInAreaToArray(worldArea, array, sorted);
        }
    };

    this.addObjectsInScreenAreaToArray = function(area, array)
    {
        var sprites = [];
        this.addSpritesInScreenAreaToArray(area, sprites);
        for (var j=0; j<sprites.length; j++)
        {
            var obj = sprites[j].getSceneObject();
            (array.lastIndexOf(obj) == -1) && array.push(obj);
        }
    };

    this.forceRedraw = function(layerId)
    {
        if (layerId)
        {
            layers[layerId].forceRedraw();
        }
        else
        {
            for (var i=0; i<sortedLayers.length; i++)
            {
                sortedLayers[i].forceRedraw();
            }
        }
    };

    this.getActiveLayerIds = function()
    {
        var result = [];
        for (var i=0; i<sortedLayers.length; i++)
        {
            result.push(sortedLayers[i].id);
        }
        return result;
    };

    this.addImageUser = function(image, user)
    {
        if (!imageUsers[image])
        {
            imageUsers[image] = [];
        }
        imageUsers[image].push(user);
    };

    this.removeImageUser = function(image, user)
    {
        imageUsers[image] && wade.removeObjectFromArray(user, imageUsers[image]);
    };

    this.removeAllImageUsers = function(image)
    {
        imageUsers[image] && (imageUsers[image].length = 0);
    };

    this.getImageUsers = function(image)
    {
        return imageUsers[image];
    };

    this.updateImageUsers = function(image)
    {
        var users = imageUsers[image];
        if (users)
        {
            for (var i=0; i<users.length; i++)
            {
                users[i].setDirtyArea && users[i].setDirtyArea();
                users[i].setActiveImage(image);
                if (users[i].getAlphaThreshold && users[i].getAlphaThreshold())
                {
                    var needImageData = true;
                }
            }
            if (needImageData)
            {
                wade.getImageData(image);
            }
        }
    };

    this.getLayerSettings = function(excludeUnusedLayers)
    {
        var result = [];
        for (var i=0; i<sortedLayers.length; i++)
        {
            var l = sortedLayers[i];
            if (!excludeUnusedLayers || l.getSpriteCount())
            {
                var customProperties = {};
                try
                {
                    // ensure custom properties are serializable to JSON
                    customProperties = JSON.parse(JSON.stringify(l.getCustomProperties()));
                }
                catch (e) {}
                result[l.id] =
                {
                    scaleFactor: l.getScaleFactor(),
                    translateFactor: l.getTranslateFactor(),
                    renderMode: l.getRenderMode(),
                    useQuadtree: l.isUsingQuadtree(),
                    resolutionFactor: l.getResolutionFactor(),
                    blur: l.getBlur(),
                    postProcessShader: l.getPostProcessShader() != l.getDefaultPixelShaderSource()? l.getPostProcessShader() : '',
                    postProcessShaderUniforms: l.getPostProcessShaderUniforms(),
                    properties: customProperties
                };
            }
        }
        return result;
    };


	this.getAllLayers = function()
	{
		return sortedLayers;
	};
}
