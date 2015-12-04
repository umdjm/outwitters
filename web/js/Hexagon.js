var MapEditor = MapEditor || {};
/**
 * A Point is simply x and y coordinates
 * @constructor
 */
MapEditor.Point = function(x, y) {
    this.X = x;
    this.Y = y;
};

/**
 * A Rectangle is x and y origin and width and height
 * @constructor
 */
MapEditor.Rectangle = function(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
};

/**
 * A Line is x and y start and x and y end
 * @constructor
 */
MapEditor.Line = function(x1, y1, x2, y2) {
    this.X1 = x1;
    this.Y1 = y1;
    this.X2 = x2;
    this.Y2 = y2;
};

/**
 * A Hexagon is a 6 sided polygon, our hexes don't have to be symmetrical, i.e. ratio of width to height could be 4 to 3
 * @constructor
 */
MapEditor.Hexagon = function(id, x, y) {
    this.Points = [];//Polygon Base
    var x1 = null;
    var y1 = null;
    if(MapEditor.Hexagon.Static.ORIENTATION == MapEditor.Hexagon.Orientation.Normal) {
        x1 = (MapEditor.Hexagon.Static.WIDTH - MapEditor.Hexagon.Static.SIDE)/2;
        y1 = (MapEditor.Hexagon.Static.HEIGHT / 2);
        this.Points.push(new MapEditor.Point(x1 + x, y));
        this.Points.push(new MapEditor.Point(x1 + MapEditor.Hexagon.Static.SIDE + x, y));
        this.Points.push(new MapEditor.Point(MapEditor.Hexagon.Static.WIDTH + x, y1 + y));
        this.Points.push(new MapEditor.Point(x1 + MapEditor.Hexagon.Static.SIDE + x, MapEditor.Hexagon.Static.HEIGHT + y));
        this.Points.push(new MapEditor.Point(x1 + x, MapEditor.Hexagon.Static.HEIGHT + y));
        this.Points.push(new MapEditor.Point(x, y1 + y));
    }
    else {
        x1 = (MapEditor.Hexagon.Static.WIDTH / 2);
        y1 = (MapEditor.Hexagon.Static.HEIGHT - MapEditor.Hexagon.Static.SIDE)/2;
        this.Points.push(new MapEditor.Point(x1 + x, y));
        this.Points.push(new MapEditor.Point(MapEditor.Hexagon.Static.WIDTH + x, y1 + y));
        this.Points.push(new MapEditor.Point(MapEditor.Hexagon.Static.WIDTH + x, y1 + MapEditor.Hexagon.Static.SIDE + y));
        this.Points.push(new MapEditor.Point(x1 + x, MapEditor.Hexagon.Static.HEIGHT + y));
        this.Points.push(new MapEditor.Point(x, y1 + MapEditor.Hexagon.Static.SIDE + y));
        this.Points.push(new MapEditor.Point(x, y1 + y));
    }

    this.Id = id;

    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;

    this.TopLeftPoint = new MapEditor.Point(this.x, this.y);
    this.BottomRightPoint = new MapEditor.Point(this.x + MapEditor.Hexagon.Static.WIDTH, this.y + MapEditor.Hexagon.Static.HEIGHT);
    this.MidPoint = new MapEditor.Point(this.x + (MapEditor.Hexagon.Static.WIDTH / 2), this.y + (MapEditor.Hexagon.Static.HEIGHT / 2));

    this.P1 = new MapEditor.Point(x + x1, y + y1);

    this.class = "";
    this.unitClass = "";
    this.playerNum = 0;
    this.health = "health3";

    this.img = new Image();

    this.imgUnit = new Image();
    this.imgUnit.width = 56;
    this.imgUnit.height = 56;
    this.imgUnit.onerror = function() {
        this.imgUnit.src = '../units/' + MapEditor.Model.getTheme() + '_other.png';
    }

    this.imgHealth = new Image();
    this.imgHealth.width = 20;
    this.imgHealth.height = 20;
    this.imgHealth.src = '../health/health3.png';
    this.imgHealth.style.backgroundColor = "blue";

    this.imgUG = new Image();
    this.imgUG.width = 48;
    this.imgUG.height = 54;

    this.offsetX = 0;
    this.offsetY = 0;
};

MapEditor.Hexagon.prototype.updateImage = function() {
    if(this.class == "" && this.unitClass == "") return;

    this.imgUG.src = '../tiles/' + MapEditor.Model.getTheme() + '_ug.png';

    if(this.class != "") {
        this.img.src = '../tiles/' + MapEditor.Model.getTheme() + '_' + this.class + '.png';

        if(this.class.match(/b\D+\d/)) {
            // base picture
            this.img.src = '../tiles/' + MapEditor.Model.getTheme() + '_' + this.class + '.png';
            this.offsetY = -43;
            this.offsetX = -20;
            this.img.width = 88;
            this.img.height = 110;
        } else if(this.class.match(/(t\d|bonus|b\D+|s\D+)/)) {
            this.offsetY = 0;
            this.offsetX = 0;
            this.img.width = 48;
            this.img.height = 42;
        } else if(this.class.match(/o\d/)) {
            this.offsetY = -15;
            this.offsetX = -2;
            this.img.width = 52;
            this.img.height = 58;
        }
    }

    if(this.isUnitPlaceable()) {
        if(this.unitClass != "") {

            var playerClass = "";
            if(this.playerNum >= 0){
                playerClass = MapEditor.Model.getPlayerRace(this.playerNum);
            }

            if(this.unitClass.indexOf("_special") > -1) {
                this.imgUnit.src = '../units/' + this.unitClass + '.png';
            } else if(!this.unitClass.match(/^other\D+$/)) {
                this.imgUnit.src = '../units/' + playerClass + '_' + this.unitClass + '.png';
            } else if(MapEditor.Model.getTheme() == "veggienauts" || MapEditor.Model.getTheme() == "scallywags") {
                this.imgUnit.src = '../units/' + playerClass + '_' + this.unitClass + '.png';
            } else {
                this.imgUnit.src = '../units/' + playerClass + '_other.png';
            }
            this.imgHealth.src = '../health/' + this.health + '.png';
        }
    } else {
        this.unitClass = "";
        this.playerNum = -1;
    }

}

/**
 * draws this Hexagon to the canvas
 * @this {MapEditor.Hexagon}
 */
MapEditor.Hexagon.prototype.draw = function(ctx) {

    if(this.PathCoOrdX % 2 == 0) {
        ctx.fillStyle = "none";
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.03)";
    }


    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(this.Points[0].X, this.Points[0].Y);
    for(var i = 1; i < this.Points.length; i++)
    {
        var p = this.Points[i];
        ctx.lineTo(p.X, p.Y);
    }

    if(this.class == "") {
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
    } else {
        if(!this.class.match(/b\D+\d/)) {
            ctx.drawImage(this.imgUG, this.TopLeftPoint.X, this.TopLeftPoint.Y, this.imgUG.width, this.imgUG.height);
        }

        ctx.drawImage(this.img, this.TopLeftPoint.X + this.offsetX, this.TopLeftPoint.Y + this.offsetY, this.img.width, this.img.height);
        ctx.strokeStyle = "none";
    }
    ctx.closePath();




    if(this.class == "") {
        ctx.fill();
    }

    ctx.stroke();


    if(this.isUnitPlaceable() && this.unitClass != "") {
        ctx.drawImage(this.imgUnit, this.TopLeftPoint.X - 3, this.TopLeftPoint.Y - 17, this.imgUnit.width, this.imgUnit.height);
        ctx.drawImage(this.imgHealth, this.TopLeftPoint.X, this.TopLeftPoint.Y - 10, this.imgHealth.width, this.imgHealth.height);
    }

    /*if(this.Id)
     {
     //draw text for debugging
     ctx.fillStyle = "black"
     ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
     ctx.textAlign = "center";
     ctx.textBaseline = 'middle';
     //var textWidth = ctx.measureText(this.Planet.BoundingHex.Id);
     ctx.fillText(this.Id, this.MidPoint.X, this.MidPoint.Y);
     }

     if(this.PathCoOrdX !== null && this.PathCoOrdY !== null && typeof(this.PathCoOrdX) != "undefined" && typeof(this.PathCoOrdY) != "undefined")
     {
     //draw co-ordinates for debugging
     ctx.fillStyle = "black"
     ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
     ctx.textAlign = "center";
     ctx.textBaseline = 'middle';
     //var textWidth = ctx.measureText(this.Planet.BoundingHex.Id);
     ctx.fillText("("+this.PathCoOrdX+","+this.PathCoOrdY+")", this.MidPoint.X, this.MidPoint.Y);
     }*/

    /*if(MapEditor.Hexagon.Static.DRAWSTATS)
     {
     ctx.strokeStyle = "black";
     ctx.lineWidth = 2;
     //draw our x1, y1, and z
     ctx.beginPath();
     ctx.moveTo(this.P1.X, this.y);
     ctx.lineTo(this.P1.X, this.P1.Y);
     ctx.lineTo(this.x, this.P1.Y);
     ctx.closePath();
     ctx.stroke();

     ctx.fillStyle = "black"
     ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
     ctx.textAlign = "left";
     ctx.textBaseline = 'middle';
     //var textWidth = ctx.measureText(this.Planet.BoundingHex.Id);
     ctx.fillText("z", this.x + this.x1/2 - 8, this.y + this.y1/2);
     ctx.fillText("x", this.x + this.x1/2, this.P1.Y + 10);
     ctx.fillText("y", this.P1.X + 2, this.y + this.y1/2);
     ctx.fillText("z = " + MapEditor.Hexagon.Static.SIDE, this.P1.X, this.P1.Y + this.y1 + 10);
     ctx.fillText("(" + this.x1.toFixed(2) + "," + this.y1.toFixed(2) + ")", this.P1.X, this.P1.Y + 10);
     }*/
};

/**
 * Returns true if the x,y coordinates are inside this hexagon
 * @this {MapEditor.Hexagon}
 * @return {boolean}
 */
MapEditor.Hexagon.prototype.isInBounds = function(x, y) {
    return this.Contains(new MapEditor.Point(x, y));
};


/**
 * Returns true if the point is inside this hexagon, it is a quick contains
 * @this {MapEditor.Hexagon}
 * @param {MapEditor.Point} p the test point
 * @return {boolean}
 */
MapEditor.Hexagon.prototype.isInHexBounds = function(/*Point*/ p) {
    if(this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
        p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
        return true;
    return false;
};

//grabbed from:
//http://www.developingfor.net/c-20/testing-to-see-if-a-point-is-within-a-polygon.html
//and
//http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#The%20C%20Code
/**
 * Returns true if the point is inside this hexagon, it first uses the quick isInHexBounds contains, then check the boundaries
 * @this {MapEditor.Hexagon}
 * @param {MapEditor.Point} p the test point
 * @return {boolean}
 */
MapEditor.Hexagon.prototype.Contains = function(/*Point*/ p) {
    var isIn = false;
    if (this.isInHexBounds(p))
    {
        //turn our absolute point into a relative point for comparing with the polygon's points
        //var pRel = new MapEditor.Point(p.X - this.x, p.Y - this.y);
        var i, j = 0;
        for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++)
        {
            var iP = this.Points[i];
            var jP = this.Points[j];
            if (
                (
                    ((iP.Y <= p.Y) && (p.Y < jP.Y)) ||
                        ((jP.Y <= p.Y) && (p.Y < iP.Y))
                    //((iP.Y > p.Y) != (jP.Y > p.Y))
                    ) &&
                    (p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)
                )
            {
                isIn = !isIn;
            }
        }
    }
    return isIn;
};


MapEditor.Hexagon.prototype.isUnitPlaceable = function() {
    if(this.class == "bonus") return true;
    if(this.class.match(/^t\d$/)) return true;
    if(this.class.match(/^s\D+$/)) return true;
    return false;
}

MapEditor.Hexagon.Orientation = {
    Normal: 0,
    Rotated: 1
};

MapEditor.Hexagon.Static = {HEIGHT:91.14378277661477
    , WIDTH:91.14378277661477
    , SIDE:50.0
    , ORIENTATION:MapEditor.Hexagon.Orientation.Normal
    , DRAWSTATS: false};//hexagons will have 25 unit sides for now
