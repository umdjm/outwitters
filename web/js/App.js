var grid, canvas, ctx, spinner = false, loadspinner = false, target, loading = 1, thisMapID = 0, readyToStoreGridDrawn = false, readyToStoreImagesLoaded = false, shownLink = false, forkedAndNoImageYet = false;

var images = new Array();

function preload() {

    var i=0, n = preload.arguments.length;
    loading = n;

    for (; i < n; i++) {
        images[i] = new Image();
        images[i].onload = function() {
            loading--;
            if(loading == 0) {
                if(thisMapID > 0) readyToStoreImagesLoaded = true;
            }
        };
        images[i].src = preload.arguments[i];
    }

}

var storeMapImage = function(callback) {
    var base64 = canvas.toDataURL();
    $("#theme").removeClass("disabled", 200);
    shownLink = true;
    $.post("ajax/send.php", {"image": true, "base64": base64, "id": thisMapID}, function(response) {
        var json = JSON.parse(response);

        if(json.error) {
            alert(json.errormessage);
            return;
        }

        callback();
    });
};

var storeMapImageForked = function() {
    var base64 = canvas.toDataURL();
    $("#theme").removeClass("disabled", 200);
    shownLink = true;
    $.post("ajax/send.php", {"image": true, "base64": base64, "id": thisMapID}, function(response) {
        var json = JSON.parse(response);

        if(json.error) {
            alert(json.errormessage);
            return;
        }

        if(json.imglink) {
            var $link = $("<a style='padding:3px;' class='btn btn-inverse btn-mini' target='_blank' href='img/map/"+thisMapID+".jpg'></a>");
            $link.hide();
            $link.html("<span class='icon-picture icon-white'></span>");
            $("#authorname").prepend($link);
            $link.fadeIn(500);
        }
    });
};


var fillMapData = function(mapID, themeID) {
    thisMapID = mapID;
    MapEditor.View.enableRating();
    $.post("http://omc.wappdesign.net/ajax/get.php", {"id": mapID}, function(response) {
        var json = JSON.parse(response);

        if(json.error) {
            alert(json.errormessage);
            return;
        }

        MapEditor.Model.setTheme(parseInt(themeID, 10));
        grid.setClasses(json, ctx);

    });
};

var onRedraw = function() {
    if(loading <= 0) {
        if(loadspinner) {
            loadspinner.stop();
        }
    }

    if(!forkedAndNoImageYet) return;
    if(shownLink) return;
    if(readyToStoreGridDrawn && readyToStoreImagesLoaded) {
        storeMapImageForked();
    }
}

$(document).ready(function() {
    var opts = {
        lines: 13, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#fff', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: true, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    target = document.getElementById("mapwrapper");
    spinner = new Spinner(opts).spin(target).stop();
    //loadspinner = new Spinner(opts).spin(target);

    loadMapData(1);

    preload(
        "tiles/scallywags_t1.png",
        "tiles/scallywags_t2.png",
        "tiles/scallywags_t3.png",
        "tiles/scallywags_t4.png",
        "tiles/scallywags_o1.png",
        "tiles/scallywags_o2.png",
        "tiles/scallywags_o3.png",
        "tiles/scallywags_bonus.png",
        "tiles/scallywags_ug.png",
        "tiles/scallywags_sblue.png",
        "tiles/scallywags_sred.png",
        "tiles/scallywags_sgreen.png",
        "tiles/scallywags_syellow.png",
        "tiles/scallywags_bblue.png",
        "tiles/scallywags_bred.png",
        "tiles/scallywags_bgreen.png",
        "tiles/scallywags_byellow.png",
        "tiles/scallywags_bblue1.png",
        "tiles/scallywags_bred1.png",
        "tiles/scallywags_bgreen1.png",
        "tiles/scallywags_byellow1.png",

        "tiles/adorables_t1.png",
        "tiles/adorables_t2.png",
        "tiles/adorables_t3.png",
        "tiles/adorables_t4.png",
        "tiles/adorables_o1.png",
        "tiles/adorables_o2.png",
        "tiles/adorables_o3.png",
        "tiles/adorables_bonus.png",
        "tiles/adorables_ug.png",
        "tiles/adorables_sblue.png",
        "tiles/adorables_sred.png",
        "tiles/adorables_sgreen.png",
        "tiles/adorables_syellow.png",
        "tiles/adorables_bblue.png",
        "tiles/adorables_bred.png",
        "tiles/adorables_bgreen.png",
        "tiles/adorables_byellow.png",
        "tiles/adorables_bblue1.png",
        "tiles/adorables_bred1.png",
        "tiles/adorables_bgreen1.png",
        "tiles/adorables_byellow1.png",

        "tiles/feedback_t1.png",
        "tiles/feedback_t2.png",
        "tiles/feedback_t3.png",
        "tiles/feedback_t4.png",
        "tiles/feedback_o1.png",
        "tiles/feedback_o2.png",
        "tiles/feedback_o3.png",
        "tiles/feedback_bonus.png",
        "tiles/feedback_ug.png",
        "tiles/feedback_sblue.png",
        "tiles/feedback_sred.png",
        "tiles/feedback_sgreen.png",
        "tiles/feedback_syellow.png",
        "tiles/feedback_bblue.png",
        "tiles/feedback_bred.png",
        "tiles/feedback_bgreen.png",
        "tiles/feedback_byellow.png",
        "tiles/feedback_bblue1.png",
        "tiles/feedback_bred1.png",
        "tiles/feedback_bgreen1.png",
        "tiles/feedback_byellow1.png",


        "tiles/veggienauts_t1.png",
        "tiles/veggienauts_t2.png",
        "tiles/veggienauts_t3.png",
        "tiles/veggienauts_t4.png",
        "tiles/veggienauts_o1.png",
        "tiles/veggienauts_o2.png",
        "tiles/veggienauts_o3.png",
        "tiles/veggienauts_bonus.png",
        "tiles/veggienauts_ug.png",
        "tiles/veggienauts_sblue.png",
        "tiles/veggienauts_sred.png",
        "tiles/veggienauts_sgreen.png",
        "tiles/veggienauts_syellow.png",
        "tiles/veggienauts_bblue.png",
        "tiles/veggienauts_bred.png",
        "tiles/veggienauts_bgreen.png",
        "tiles/veggienauts_byellow.png",
        "tiles/veggienauts_bblue1.png",
        "tiles/veggienauts_bred1.png",
        "tiles/veggienauts_bgreen1.png",
        "tiles/veggienauts_byellow1.png",

        "units/adorables_heavyblue.png",
        "units/adorables_heavyred.png",
        "units/adorables_heavygreen.png",
        "units/adorables_heavyyellow.png",
        "units/adorables_soldierblue.png",
        "units/adorables_soldierred.png",
        "units/adorables_soldiergreen.png",
        "units/adorables_soldieryellow.png",
        "units/adorables_runnerblue.png",
        "units/adorables_runnerred.png",
        "units/adorables_runnergreen.png",
        "units/adorables_runneryellow.png",
        "units/adorables_medicblue.png",
        "units/adorables_medicred.png",
        "units/adorables_medicgreen.png",
        "units/adorables_medicyellow.png",
        "units/adorables_sniperblue.png",
        "units/adorables_sniperred.png",
        "units/adorables_snipergreen.png",
        "units/adorables_sniperyellow.png",
        "units/adorables_specialblue.png",
        "units/adorables_specialred.png",
        "units/adorables_specialgreen.png",
        "units/adorables_specialyellow.png",

        "units/feedback_heavyblue.png",
        "units/feedback_heavyred.png",
        "units/feedback_heavygreen.png",
        "units/feedback_heavyyellow.png",
        "units/feedback_soldierblue.png",
        "units/feedback_soldierred.png",
        "units/feedback_soldiergreen.png",
        "units/feedback_soldieryellow.png",
        "units/feedback_runnerblue.png",
        "units/feedback_runnerred.png",
        "units/feedback_runnergreen.png",
        "units/feedback_runneryellow.png",
        "units/feedback_medicblue.png",
        "units/feedback_medicred.png",
        "units/feedback_medicgreen.png",
        "units/feedback_medicyellow.png",
        "units/feedback_sniperblue.png",
        "units/feedback_sniperred.png",
        "units/feedback_snipergreen.png",
        "units/feedback_sniperyellow.png",
        "units/feedback_specialblue.png",
        "units/feedback_specialred.png",
        "units/feedback_specialgreen.png",
        "units/feedback_specialyellow.png",

        "units/veggienauts_heavyblue.png",
        "units/veggienauts_heavyred.png",
        "units/veggienauts_heavygreen.png",
        "units/veggienauts_heavyyellow.png",
        "units/veggienauts_soldierblue.png",
        "units/veggienauts_soldierred.png",
        "units/veggienauts_soldiergreen.png",
        "units/veggienauts_soldieryellow.png",
        "units/veggienauts_runnerblue.png",
        "units/veggienauts_runnerred.png",
        "units/veggienauts_runnergreen.png",
        "units/veggienauts_runneryellow.png",
        "units/veggienauts_medicblue.png",
        "units/veggienauts_medicred.png",
        "units/veggienauts_medicgreen.png",
        "units/veggienauts_medicyellow.png",
        "units/veggienauts_sniperblue.png",
        "units/veggienauts_sniperred.png",
        "units/veggienauts_snipergreen.png",
        "units/veggienauts_sniperyellow.png",
        "units/veggienauts_specialblue.png",
        "units/veggienauts_specialred.png",
        "units/veggienauts_specialgreen.png",
        "units/veggienauts_specialyellow.png",
        "units/veggienauts_otherblue.png",
        "units/veggienauts_otherred.png",
        "units/veggienauts_othergreen.png",
        "units/veggienauts_otheryellow.png",

        "units/scallywags_heavyblue.png",
        "units/scallywags_heavyred.png",
        "units/scallywags_heavygreen.png",
        "units/scallywags_heavyyellow.png",
        "units/scallywags_soldierblue.png",
        "units/scallywags_soldierred.png",
        "units/scallywags_soldiergreen.png",
        "units/scallywags_soldieryellow.png",
        "units/scallywags_runnerblue.png",
        "units/scallywags_runnerred.png",
        "units/scallywags_runnergreen.png",
        "units/scallywags_runneryellow.png",
        "units/scallywags_medicblue.png",
        "units/scallywags_medicred.png",
        "units/scallywags_medicgreen.png",
        "units/scallywags_medicyellow.png",
        "units/scallywags_sniperblue.png",
        "units/scallywags_sniperred.png",
        "units/scallywags_snipergreen.png",
        "units/scallywags_sniperyellow.png",
        "units/scallywags_specialblue.png",
        "units/scallywags_specialred.png",
        "units/scallywags_specialgreen.png",
        "units/scallywags_specialyellow.png",
        "units/scallywags_otherblue.png",
        "units/scallywags_otherred.png",
        "units/scallywags_othergreen.png",
        "units/scallywags_otheryellow.png");
});


getHexGridWH();
setInterval(function() { grid.redraw(ctx) }, 1000);