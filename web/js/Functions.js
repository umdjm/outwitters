function findHexWithWidthAndHeight()
{
    var width = 48;
    var height = 42;


    var y = height/2.0;

    //solve quadratic
    var a = -3.0;
    var b = (-2.0 * width);
    var c = (Math.pow(width, 2)) + (Math.pow(height, 2));

    var z = (-b - Math.sqrt(Math.pow(b,2)-(4.0*a*c)))/(2.0*a);

    var x = (width - z)/2.0;

    MapEditor.Hexagon.Static.WIDTH = width;
    MapEditor.Hexagon.Static.HEIGHT = height;
    MapEditor.Hexagon.Static.SIDE = z;
}

function drawHexGrid()
{
    grid = new MapEditor.Grid(700, 700);
    canvas = document.getElementById("map");
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 700, 700);
    for(var h in grid.Hexes)
    {
        grid.Hexes[h].draw(ctx);
    }
}

function getHexGridWH()
{
    findHexWithWidthAndHeight();
    drawHexGrid();
}
function strip_tags (input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
