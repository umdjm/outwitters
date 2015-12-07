/**
 * A Grid is the model of the playfield containing hexes
 * @constructor
 */
MapEditor.Grid = function(/*double*/ width, /*double*/ height) {

    this.Hexes = [];
    //setup a dictionary for use later for assigning the X or Y CoOrd (depending on Orientation)
    var HexagonsByXOrYCoOrd = {}; //Dictionary<int, List<Hexagon>>

    var row = 0;
    var y = 0.0;
    while (y + MapEditor.Hexagon.Static.HEIGHT <= height)
    {
        var col = 0;

        var offset = 0.0;
        if (row % 2 == 1)
        {
            if(MapEditor.Hexagon.Static.ORIENTATION == MapEditor.Hexagon.Orientation.Normal)
                offset = (MapEditor.Hexagon.Static.WIDTH - MapEditor.Hexagon.Static.SIDE)/2 + MapEditor.Hexagon.Static.SIDE;
            else
                offset = MapEditor.Hexagon.Static.WIDTH / 2;
            col = 1;
        }

        var x = offset;
        while (x + MapEditor.Hexagon.Static.WIDTH <= width)
        {
            var hexId = this.GetHexId(row, col);
            var h = new MapEditor.Hexagon(hexId, x, y);

            var pathCoOrd = col;
            if(MapEditor.Hexagon.Static.ORIENTATION == MapEditor.Hexagon.Orientation.Normal)
                h.PathCoOrdX = col;//the column is the x coordinate of the hex, for the y coordinate we need to get more fancy
            else {
                h.PathCoOrdY = row;
                pathCoOrd = row;
            }

            this.Hexes.push(h);

            if (!HexagonsByXOrYCoOrd[pathCoOrd])
                HexagonsByXOrYCoOrd[pathCoOrd] = [];
            HexagonsByXOrYCoOrd[pathCoOrd].push(h);

            col+=2;
            if(MapEditor.Hexagon.Static.ORIENTATION == MapEditor.Hexagon.Orientation.Normal)
                x += MapEditor.Hexagon.Static.WIDTH + MapEditor.Hexagon.Static.SIDE;
            else
                x += MapEditor.Hexagon.Static.WIDTH;
        }
        row++;
        if(MapEditor.Hexagon.Static.ORIENTATION == MapEditor.Hexagon.Orientation.Normal)
            y += MapEditor.Hexagon.Static.HEIGHT / 2;
        else
            y += (MapEditor.Hexagon.Static.HEIGHT - MapEditor.Hexagon.Static.SIDE)/2 + MapEditor.Hexagon.Static.SIDE;
    }

    //finally go through our list of hexagons by their x co-ordinate to assign the y co-ordinate
    for (var coOrd1 in HexagonsByXOrYCoOrd)
    {
        var hexagonsByXOrY = HexagonsByXOrYCoOrd[coOrd1];
        var coOrd2 = Math.floor(coOrd1 / 2) + (coOrd1 % 2);
        for (var i in hexagonsByXOrY)
        {
            var h = hexagonsByXOrY[i];//Hexagon
            if(MapEditor.Hexagon.Static.ORIENTATION == MapEditor.Hexagon.Orientation.Normal)
                h.PathCoOrdY = coOrd2++;
            else
                h.PathCoOrdX = coOrd2++;
        }
    }
};

MapEditor.Grid.Static = {Letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'};

MapEditor.Grid.prototype.GetHexId = function(row, col) {
    var letterIndex = row;
    var letters = "";
    while(letterIndex > 25)
    {
        letters = MapEditor.Grid.Static.Letters[letterIndex%26] + letters;
        letterIndex -= 26;
    }

    return MapEditor.Grid.Static.Letters[letterIndex] + letters + (col + 1);
};

/**
 * Returns a hex at a given point
 * @this {MapEditor.Grid}
 * @return {MapEditor.Hexagon}
 */
MapEditor.Grid.prototype.GetHexAt = function(/*Point*/ p) {
    //find the hex that contains this point
    for (var h in this.Hexes)
    {
        if (this.Hexes[h].Contains(p))
        {
            return this.Hexes[h];
        }
    }

    return null;
};

/**
 * Returns a distance between two hexes
 * @this {MapEditor.Grid}
 * @return {number}
 */
MapEditor.Grid.prototype.GetHexDistance = function(/*Hexagon*/ h1, /*Hexagon*/ h2) {
    //a good explanation of this calc can be found here:
    //http://playtechs.blogspot.com/2007/04/hex-grids.html
    var deltaX = h1.PathCoOrdX - h2.PathCoOrdX;
    var deltaY = h1.PathCoOrdY - h2.PathCoOrdY;
    return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX - deltaY)) / 2);
};

/**
 * Returns a distance between two hexes
 * @this {MapEditor.Grid}
 * @return {MapEditor.Hexagon}
 */
MapEditor.Grid.prototype.GetHexById = function(id) {
    for(var i in this.Hexes)
    {
        if(this.Hexes[i].Id == id)
        {
            return this.Hexes[i];
        }
    }
    return null;
};


MapEditor.Grid.prototype.redraw = function(ctx) {
    var topLayer = [];
    ctx.clearRect(0,0,700,700);
    for(var i in this.Hexes)
    {
        if(this.Hexes[i].class.match(/b\D+\d/)) {
            // base
            topLayer.push(this.Hexes[i]);
        } else {
            this.Hexes[i].draw(ctx);
        }
    }

    for(var i=0, n=topLayer.length; i<n; i++) {
        topLayer[i].draw(ctx);
    }

    onRedraw();
};

MapEditor.Grid.prototype.GetAdjacentHexes = function(/*Point*/ p) {
    var adjacents = [];
    var checkPoint = new MapEditor.Point(p.X, p.Y),
        checkRadius = 35,
        pi = Math.PI,
        rad = 0,
        toRight = 0,
        toTop = 0;
    for (var h in this.Hexes)
    {
        for(var deg=0; deg<360; deg+=30) {
            rad = deg * (pi/180);
            toRight = Math.cos(rad) * checkRadius;
            toTop = Math.sin(rad) * checkRadius;

            checkPoint = new MapEditor.Point(p.X + toRight, p.Y + toTop);

            var hexInAdjacents = false;
            var i;
            for (i = 0; i < adjacents.length; i++) {
                if (adjacents[i] === this.Hexes[h]) {
                    hexInAdjacents = true;
                }
            }

            if (this.Hexes[h].Contains(checkPoint) && !hexInAdjacents)
            {
                adjacents.push(this.Hexes[h]);
            }
        }
    }

    return adjacents;
}

MapEditor.Grid.prototype.getClasses = function() {
    var array = [];
    var current = {};

    for(var h in this.Hexes) {
        current = {};
        current.class = this.Hexes[h].class;
        current.unitClass = this.Hexes[h].unitClass;
        current.playerNum = this.Hexes[h].playerNum;
        current.health = this.Hexes[h].health;

        if(this.Hexes[h].hasMoved)
            current.hasMoved = true;
        else this.Hexes[h].hasMoved = false;

        if(this.Hexes[h].hasAttacked)
            current.hasAttacked = true;
        else this.Hexes[h].hasAttacked = false;

        if(this.Hexes[h].hasSpawned)
            current.hasSpawned = true;
        else this.Hexes[h].hasSpawned = false;

        if(this.Hexes[h].witSpacePlayerNum > -1)
            current.witSpacePlayerNum = this.Hexes[h].witSpacePlayerNum;

        array.push(current);
    }

    return array;
}

MapEditor.Grid.prototype.getWitBonus = function(color) {
    var result = 0;
    for(var h in this.Hexes) {
        hex = this.Hexes[h];
        if(hex.witSpacePlayerNum > -1 && MapEditor.Model.getPlayerColor(hex.witSpacePlayerNum) == color)
            result++;
    }
    return result;
}

MapEditor.Grid.prototype.setClasses = function(array, ctx) {
    for(var h in this.Hexes) {
        current = array[h];
        this.Hexes[h].class = current.class;
        this.Hexes[h].unitClass = current.unitClass;
        if(current.playerNum == 0 || current.playerNum == 1 || current.playerNum == 2 || current.playerNum == 3)
            this.Hexes[h].playerNum = current.playerNum;
        else this.Hexes[h].playerNum = 0;

        if(this.Hexes[h].isValidHealth(current.health)){
            this.Hexes[h].health = current.health;
        }
        else {
            this.Hexes[h].health = this.Hexes[h].getDefaultHealth();
        }

        if(current.hasMoved)this.Hexes[h].hasMoved = true;
        else this.Hexes[h].hasMoved = false;

        if(current.hasAttacked) this.Hexes[h].hasAttacked = true;
        else this.Hexes[h].hasAttacked = false;

        if(current.hasSpawned) this.Hexes[h].hasSpawned = true;
        else this.Hexes[h].hasSpawned = false;

        if(typeof(current.witSpacePlayerNum) !== "undefined")
            this.Hexes[h].witSpacePlayerNum = current.witSpacePlayerNum;
        else this.Hexes[h].witSpacePlayerNum = -1;

        this.Hexes[h].updateImage();
        this.Hexes[h].draw(ctx);
    }
    readyToStoreGridDrawn = true;
}


MapEditor.Grid.prototype.restartTurn = function(ctx) {
    for(var h in this.Hexes) {
        this.Hexes[h].hasMoved = false;
        this.Hexes[h].hasAttacked = false;
        this.Hexes[h].hasSpawned = false;
        this.Hexes[h].updateImage();
    }
}

MapEditor.Grid.prototype.updateImages = function(ctx) {

    for (var h in this.Hexes)
    {
        this.Hexes[h].updateImage();
    }

    this.redraw(ctx);
}