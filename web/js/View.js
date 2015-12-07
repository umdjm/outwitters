MapEditor.View = (function() {
    var
        model = MapEditor.Model,
        eraseOnDrag = false,
        mousedown = false,
        themeChanging = false;
        mobiMoveModeSelectedHex = null;
        mobiHex = null;

    var enableRating = function() {
        $('input.star').rating("disable");
        $('input.star').attr("disabled", "disabled");

        if($.cookie('own-map-' + thisMapID) != "true") {
            $('input.star').removeAttr("disabled");
            $('input.star').rating({
                focus: function(value, link){
                    if($(this).attr("disabled")) return;
                    var $tip = $('#rating span#avg');
                    $tip.data("rating", $tip.html());
                    $tip.html(link.title);
                },
                blur: function(value, link){
                    if($(this).attr("disabled")) return;
                    var $tip = $('#rating span#avg');
                    $tip.html($tip.data("rating"));
                },
                callback: function(value, link){
                    //$('input.star').rating("disable");
                    $.post("ajax/rate.php", {"rating": value, "id": thisMapID, "alreadyvoted": ($.cookie('rated-map-' + thisMapID) ? 1 : 0)}, function(response) {
                        var json = JSON.parse(response);
                        if(json.error) {
                            alert(json.errormessage);
                            var $tip = $('#rating span#avg');
                            $tip.html($tip.data("rating"));
                        } else {
                            $.cookie('rated-map-' + thisMapID, true, { expires: (365*10), path: '/' });
                            $("span#avg").html(json.average + "<span class='small'> / 5 (" + json.votes + " vote" + (json.votes > 1 ? "s" : "") + ")</span> - Your vote has been cast.");
                            $("span#avg").data("rating", json.average + "<span class='small'> / 5 (" + json.votes + " vote" + (json.votes > 1 ? "s" : "") + ")</span> - Your vote has been cast.");
                        }
                    });
                }
            });
        }
    };

    if($("input#author").length) {
        $("input#author").val($.cookie("author") || "");
    }

    $("#replayBtn").click(function(){
        var boardState = model.getBoardState();
        var moveHistory = model.getMoveQueue();
        var i = 0;
        function moveReplayForward(){
            if(i < moveHistory.length){
                grid.setClasses(moveHistory[i].hexes, ctx);
                $("#" + boardState.selectedColor + "Wits").val(moveHistory[i].wits[boardState.selectedColor]);
                i++;
                setTimeout(moveReplayForward, 1000);
            }
            else {
                grid.setClasses(boardState.hexes, ctx);
                $("#" + boardState.selectedColor + "Wits").val(boardState.wits[boardState.selectedColor]);
            }
        }
        moveReplayForward();
    });

    $(".witCounter").change(function(){
        var inputWits = $( this ).val();
        var witColor = $(this).data("color");
        if(isNaN(inputWits)) return;
        model.setWitsForColor(witColor, parseInt(inputWits));
    });

    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr("title");
 
        // Show/Hide Tabs
        $(".tab").each(function() {
            $(this).hide();
            $(this).removeClass("active");
        });

        $("#" + currentAttrValue).show();
        $("#" + currentAttrValue).addClass("active");

        model.setMoveMode(currentAttrValue == "moveMode");

        if(currentAttrValue == "moveMode"){
            var playerNumber = model.getCurrentPlayerNum();
            var selectedColor = model.getPlayerColor(playerNumber);
            $(".moveModeColor.selected").removeClass("selected");
            $(".moveModeColor#"+selectedColor).addClass("selected");
        }
        //jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
 
        e.preventDefault();
    });

    $("button#mapSelectionBtn").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        loadMapData($(this).attr("title"));
    });

    $("button#theme").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if(themeChanging || $(this).hasClass("disabled")) return;

        themeChanging = true;
        if($("#other").hasClass("selected")) {
            model.setClass("t1");
            $("#other").removeClass();
            $("#t1").addClass("selected");
        }

        model.swapTheme();
        var oldClass = $("body").attr("class");
        $("body").switchClass(oldClass, model.getTheme(), 300, function() {
            grid.updateImages(ctx);
            themeChanging = false;
        });
    });

    $("div.moveModeColor").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var clickedColor = $(this).attr("id");
        if(confirm("Do you want to start a new turn?")) {
            model.pushMove(model.getBoardState());
            $(".moveModeColor.selected").removeClass("selected");
            $(this).addClass("selected");
            model.setColor(clickedColor);
            model.setWits(model.getWits() + 5 + grid.getWitBonus(clickedColor));
            grid.restartTurn(ctx);
        }
    });
    $("div.color").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        model.setColor($(this).attr("id"));
        $(".color.selected").removeClass("selected");
        $(this).addClass("selected");

        var oldClass = $("#palette").attr("class");
        $("#palette").removeClass(oldClass).addClass($(this).attr("id"));

        var playerRace = model.getSelectedPlayerRace();

        var oldPlayerClass = $("#player_race").attr("class");
        $("#player_race").removeClass(oldPlayerClass).addClass(playerRace);

        $(".race.selected").removeClass("selected");
        $("#race_"+playerRace).addClass("selected");

        grid.updateImages(ctx);
    });

    $("div.unit").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if(model.isMoveMode()){
            var startState = model.getBoardState();
            var hex = model.getMoveStartHex();
            hex.hasSpawned = true;
            var unitType = $(this).attr("id");
            hex.unitClass = unitType + model.getPlayerColor(hex.playerNum);
            var unit = MapEditor.Config[hex.getUnitType()];
            hex.health = "health" + unit.INITIAL_HEALTH;
            model.setWits(model.getWits() - unit.SPAWN_COST);
            model.pushMove(startState);
            $("#moveModeUnits").hide();
            hex.updateImage();
        }else{
            model.setUnit($(this).attr("id"));
            $(".unit.selected, .terrain.selected").removeClass("selected");
            $(this).addClass("selected");
        }
    });

    $("div.health").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        model.setHealth($(this).attr("id"));
        $(".health.selected").removeClass("selected");
        $(this).addClass("selected");
    });

    $("div.race").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        model.setSelectedPlayerRace($(this).attr("title"));

        var oldClass = $("#player_race").attr("class");
        $("#player_race").removeClass(oldClass).addClass(model.getSelectedPlayerRace());

        $(".race.selected").removeClass("selected");
        $(this).addClass("selected");

        grid.updateImages(ctx);
    });

    $("div.terrain").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        model.setClass($(this).attr("id"));
        $(".unit.selected, .terrain.selected").removeClass("selected");
        $(this).addClass("selected");
    });

    $("canvas#map").mousemove(function(e) {
        var offset = $(this).offset();
        var hex = grid.GetHexAt(new MapEditor.Point(e.pageX - offset.left, e.pageY - offset.top));
        var currentUnit = model.getUnit();

        if(!hex) {
            $(this).css("cursor", "not-allowed");
            return;
        } else if(!currentUnit) {
            $(this).css("cursor", "pointer");
            return;
        }

        if(!hex.isUnitPlaceable()) {
            $(this).css("cursor", "not-allowed");
        } else {
            $(this).css("cursor", "pointer");
        }
    });

    $("canvas#map").mousedown(function(e) {
        e.preventDefault();
        var offset = $(this).offset();
        var hex = grid.GetHexAt(new MapEditor.Point(e.pageX - offset.left, e.pageY - offset.top));
        var startState = model.getBoardState();

        if(!hex) return;

        if(model.isMoveMode()) {
            var oldHex = model.getMoveStartHex();
            if(hex.unitClass != ""){
                if(oldHex != null && oldHex.getUnitType() == "Medic" && (hex.playerNum == oldHex.playerNum || hex.playerNum == oldHex.playerNum + 2 || hex.playerNum == oldHex.playerNum - 2)){
                    //Medic Boost Attempt
                    var unit = MapEditor.Config["Medic"];
                    var unitAttackRange = unit.ATTACK_RANGE;
                    var hexDistance = grid.GetHexDistance(oldHex, hex);
                    if(unitAttackRange >= hexDistance){
                        var hexUnitType = hex.getUnitType();
                        var hexUnit = MapEditor.Config[hexUnitType];
                        var maxHealth = hexUnit.MAX_HEALTH;
                        hex.health = "health" + maxHealth;
                        model.spendWit();
                        oldHex.hasAttacked = true;
                        oldHex.updateImage();
                        model.pushMove(startState);
                        model.setMoveStartHex(null);
                    }
                }else if(oldHex != null && oldHex.getUnitType() == "Mobi" && (hex.playerNum == oldHex.playerNum || hex.playerNum == oldHex.playerNum + 2 || hex.playerNum == oldHex.playerNum - 2)){
                    //Mobi Select
                    if(!oldHex.hasAttacked){
                        mobiMoveModeSelectedHex = hex;
                        mobiHex = oldHex;
                    }
                }else if(oldHex != null && oldHex.getUnitType() == "Bombshell" && hex == oldHex){
                    //Bombshell Sit
                    var playerNum = hex.playerNum;
                    var playerRace = model.getPlayerRace(playerNum);
                    var playerColor = model.getPlayerColor(playerNum);
                    hex.unitClass = playerRace+"_other"+playerColor;
                    var boosted = (hex.health == "health2");
                    if(boosted){
                        hex.health = "health4";
                    }else{
                        hex.health = "health3";
                    }
                    hex.hasMoved = true;
                    hex.hasAttacked = true;
                    model.setMoveStartHex(null);
                    model.pushMove(startState);
                    model.spendWit();
                }else if(oldHex != null && oldHex.getUnitType() == "Bombshelled"){
                    //Bombshell Stand
                    if(hex == oldHex && !oldHex.hasAttacked){
                        var playerNum = hex.playerNum;
                        var playerRace = model.getPlayerRace(playerNum);
                        var playerColor = model.getPlayerColor(playerNum);
                        hex.unitClass = playerRace+"_special"+playerColor;
                        var boosted = (hex.health == "health4");
                        if(boosted){
                            hex.health = "health2";
                        }else{
                            hex.health = "health1";
                        }
                        model.setMoveStartHex(null);
                        model.pushMove(startState);
                        model.spendWit();
                    }else if(!oldHex.hasAttacked && (hex.playerNum != oldHex.playerNum) && (hex.playerNum != oldHex.playerNum + 2) && (hex.playerNum != oldHex.playerNum - 2)){
                        var unit = MapEditor.Config["Bombshelled"];
                        var unitAttackRange = unit.ATTACK_RANGE;
                        var hexDistance = grid.GetHexDistance(oldHex, hex);
                        if(unitAttackRange >= hexDistance){
                            var attack = unit.ATTACK_STRENGTH;
                            var oldHealth = parseInt(hex.health.replace("health", ""));
                            var newHealth = oldHealth - attack;
                            if(newHealth <= 0){
                                hex.unitClass = "";
                                hex.health = "";
                            }else {
                                model.spendWit();
                                hex.health = "health" + newHealth;
                            }
                            oldHex.hasAttacked = true;
                            oldHex.updateImage();

                            var adjacents = grid.GetAdjacentHexes(hex.MidPoint);
                            for(var i = 0; i < adjacents.length; i++){
                                var adjacentHex = adjacents[i];
                                if(adjacentHex.unitClass != "" && (adjacentHex.playerNum != oldHex.playerNum) && (adjacentHex.playerNum != oldHex.playerNum + 2) && (adjacentHex.playerNum != oldHex.playerNum - 2)){
                                    var health1 = parseInt(adjacentHex.health.replace("health", ""));
                                    var health2 = health1 - 1;
                                    if(health2 <= 0){
                                        adjacentHex.unitClass = "";
                                        adjacentHex.health = "";
                                        var wits = model.getWits();
                                        model.setWits(wits+1);
                                    }else{
                                        adjacentHex.health = "health" + health2;
                                    }
                                    adjacentHex.updateImage();
                                }
                            }

                            model.pushMove(startState);
                            model.setMoveStartHex(null);
                        }
                    }
                    else if(hex.playerNum == model.getCurrentPlayerNum() && hex.unitClass != ""){
                        //change selected character
                        model.setMoveStartHex(hex);
                    }
                    else {
                        //unselect character
                        model.setMoveStartHex(null);
                    }
                }else if(oldHex != null && oldHex.getUnitType() == "Scrambler" && (hex.playerNum != oldHex.playerNum) && (hex.playerNum != oldHex.playerNum + 2) && (hex.playerNum != oldHex.playerNum - 2)){
                    var unit = MapEditor.Config["Scrambler"];
                    var unitAttackRange = unit.ATTACK_RANGE;
                    var hexDistance = grid.GetHexDistance(oldHex, hex);
                    if(unitAttackRange >= hexDistance){
                        var hexPlayerNum = hex.playerNum;
                        var hexUnit = hex.getUnitType();
                        var hexPlayerColor = model.getPlayerColor(hexPlayerNum);
                        var hexPlayerRace = model.getPlayerRace(hexPlayerNum);

                        var newPlayerColor = model.getPlayerColor(oldHex.playerNum);
                        if(hex.unitClass.indexOf("_special") > -1){
                            hex.unitClass = hexPlayerRace + "_special" + newPlayerColor;
                        }else if(hex.unitClass.indexOf("_other") > -1){
                            hex.unitClass = hexPlayerRace + "_other" + newPlayerColor;
                        }else{
                            hex.unitClass = hexUnit.toLowerCase() + newPlayerColor;
                        }

                        hex.health = "health1";
                        hex.playerNum = oldHex.playerNum;
                        hex.updateImage();
                        oldHex.hasAttacked = true;
                        oldHex.updateImage();
                        model.pushMove(startState);
                        model.setMoveStartHex(null);
                    }
                    else if(hex.playerNum == model.getCurrentPlayerNum() && hex.unitClass != ""){
                        //change selected character
                        model.setMoveStartHex(hex);
                    }
                    else {
                        //unselect character
                        model.setMoveStartHex(null);
                    }
                }else if(oldHex != null && (hex.playerNum != oldHex.playerNum) && (hex.playerNum != oldHex.playerNum + 2) && (hex.playerNum != oldHex.playerNum - 2) && !oldHex.hasAttacked){
                    //Attack Attempt
                    var unitType = oldHex.getUnitType();
                    var unit = MapEditor.Config[unitType];
                    var unitAttackRange = unit.ATTACK_RANGE;
                    var hexDistance = grid.GetHexDistance(oldHex, hex);
                    if(unitAttackRange >= hexDistance){
                        //Attack Success
                        if(MapEditor.Config.hasOwnProperty(unitType)){
                            var attack = MapEditor.Config[unitType].ATTACK_STRENGTH;
                            var oldHealth = parseInt(hex.health.replace("health", ""));
                            var newHealth = oldHealth - attack;
                            if(newHealth <= 0){
                                hex.unitClass = "";
                                hex.health = "";
                            }else {
                                model.spendWit();
                                hex.health = "health" + newHealth;
                            }
                            oldHex.hasAttacked = true;
                            oldHex.updateImage();
                        }
                        model.pushMove(startState);
                        model.setMoveStartHex(null);
                    }
                    else if(hex.playerNum == model.getCurrentPlayerNum() && hex.unitClass != ""){
                        //change selected character
                        model.setMoveStartHex(hex);
                    }
                    else {
                        //unselect character
                        model.setMoveStartHex(null);
                    }
                }
                else if(hex.playerNum == model.getCurrentPlayerNum() && hex.unitClass != ""){
                    //change selected character
                    model.setMoveStartHex(hex);
                }
                else {
                    //unselect character
                    model.setMoveStartHex(null);
                }
            } else if(mobiMoveModeSelectedHex != null){
                //Mobi spit
                var hexDistance = grid.GetHexDistance(hex, mobiHex);
                var mobiUnit = MapEditor.Config["Mobi"];
                if(mobiUnit.ATTACK_RANGE >= hexDistance){
                    hex.unitClass = mobiMoveModeSelectedHex.unitClass;
                    hex.playerNum = mobiMoveModeSelectedHex.playerNum;
                    hex.health = mobiMoveModeSelectedHex.health;
                    hex.hasAttacked = mobiMoveModeSelectedHex.hasAttacked;
                    hex.hasMoved = true;

                    mobiMoveModeSelectedHex.unitClass = "";
                    mobiMoveModeSelectedHex.health = "";
                    mobiMoveModeSelectedHex.hasMoved = false;
                    mobiMoveModeSelectedHex.hasAttacked = false;
                    if(!mobiMoveModeSelectedHex.class.match(/(s\D+)/)){ //not moving off a spawn tile
                        mobiMoveModeSelectedHex.playerNum = 0;
                    }

                    hex.updateImage();
                    mobiMoveModeSelectedHex.updateImage();
                    model.pushMove(startState);
                    model.spendWit();

                    mobiHex.hasAttacked = true;
                }

                mobiMoveModeSelectedHex = null;
                mobiHex = null;
                model.setMoveStartHex(null);
            } else if(oldHex != null && oldHex.unitClass != "") {
                //Move Attempt
                var unitType = oldHex.getUnitType();
                var unit = MapEditor.Config[unitType];
                var unitMoveRange = unit.RANGE;
                var hexDistance = grid.GetHexDistance(oldHex, hex);
                if(unitMoveRange >= hexDistance && !oldHex.hasMoved){
                    //Move Success
                    hex.unitClass = oldHex.unitClass;
                    hex.playerNum = oldHex.playerNum;
                    hex.health = oldHex.health;
                    hex.hasAttacked = oldHex.hasAttacked;
                    hex.hasMoved = true;

                    oldHex.unitClass = "";
                    oldHex.health = "";
                    oldHex.hasMoved = false;
                    oldHex.hasAttacked = false;
                    if(!oldHex.class.match(/(s\D+)/)){ //not moving off a spawn tile
                        oldHex.playerNum = 0;
                    }

                    oldHex.updateImage();
                    model.pushMove(startState);
                    model.setMoveStartHex(null);
                    model.spendWit();

                    if(hex.class.match(/bonus/)){
                        hex.witSpacePlayerNum = hex.playerNum;
                    }
                }
                else if(hex.playerNum == model.getCurrentPlayerNum() && hex.unitClass != ""){
                    //Replace selected character
                    model.setMoveStartHex(hex);
                }
                else {
                    //Unselect character
                    model.setMoveStartHex(null);
                }
            }

            if(!hex.hasSpawned && hex.playerNum == model.getCurrentPlayerNum() && hex.class.match(/(s\D+)/) && hex.unitClass == ""){
            //spawn tile selected and no unit on top
                $("#moveModeUnits").show();
                var oldClass = $("#moveModeUnits").attr("class");
                $("#moveModeUnits").removeClass(oldClass);
                var newClass = model.getPlayerRace(hex.playerNum);
                $("#moveModeUnits").addClass(newClass);

                var oldPalette = $("#palette").attr("class");
                $("#palette").removeClass(oldPalette);
                var newPalette = model.getPlayerColor(hex.playerNum);
                $("#palette").addClass(newPalette);

                model.setMoveStartHex(hex);
            }else{
                //hide spawn
                $("#moveModeUnits").hide();
            }

        }else if(model.isBaseSelected() && !model.getUnit()) {
            //Not move mode
            var
                adjacents = grid.GetAdjacentHexes(hex.MidPoint),
                selectedClass = model.getClass(),
                n = adjacents.length,
                i = 0;

            if(hex.class == selectedClass || hex.class == selectedClass + model.getBase()) {
                // remove base completely

                for(; i<n; i++) {
                    adjacents[i].class = "";
                    adjacents[i].updateImage();
                }

                hex.class = "";


            } else {
                // create (another) base

                for(; i<n; i++) {
                    adjacents[i].class = selectedClass;
                    adjacents[i].updateImage();
                }

                hex.class = selectedClass + model.getBase();
            }

        } else {
            if(model.getUnit()) {
                var selectedUnit = model.getUnit();
                var selectedPlayerNum = model.getCurrentPlayerNum();
                if(selectedUnit == "rmv") {
                    hex.unitClass = "";
                    hex.playerNum = -1;
                    hex.health = "";
                    eraseOnDrag = false;
                } else if(hex.unitClass == selectedUnit && hex.unitClass != "") {
                    hex.unitClass = "";
                    hex.playerNum = -1;
                    hex.health = "";
                    eraseOnDrag = true;
                } else {
                    hex.unitClass = selectedUnit;
                    hex.playerNum = selectedPlayerNum;

                    hex.health = hex.getDefaultHealth();
                    if($(".health.selected").length > 0){
                        hex.health = "health" + parseInt($(".health.selected").attr("title"));
                        $(".health.selected").removeClass("selected");
                    }
                    eraseOnDrag = false;
                }
            } else {
                var selectedClass = model.getClass();
                if(hex.class == selectedClass) {
                    hex.class = "";
                    hex.health = "";
                    eraseOnDrag = true;
                } else {
                    hex.class = selectedClass;
                    hex.health = MapEditor.Model.getHealth();
                    eraseOnDrag = false;
                }
            }
            mousedown = true;
        }

        hex.updateImage();
        grid.redraw(ctx);
        return false;
    });

    $("canvas#map").mousemove(function(e) {
        e.preventDefault();
        if(!mousedown) return;

        var offset = $(this).offset();
        var hex = grid.GetHexAt(new MapEditor.Point(e.pageX - offset.left, e.pageY - offset.top));

        if(!hex) {
            return;
        }

        if(model.getUnit()) {
            return;
        } else {
            var selectedClass = model.getClass();
            if(hex.class == selectedClass && eraseOnDrag) {
                hex.class = "";
            } else if(!eraseOnDrag) {
                hex.class = selectedClass;
            }
        }

        hex.updateImage();
        grid.redraw(ctx);
    });

    $("canvas#map").mouseup(function(e) {
        e.preventDefault();
        eraseOnDrag = false;
        mousedown = false;
    });

    $("input#mapname").keyup(function() {
        if($(this).val().length == 0) {
            $("p#mapname").html("Yeah, finding a name is quite hard.");
        } else {
            $("p#mapname").html(strip_tags($(this).val()));
        }
    });

    $("input#author").keyup(function() {
        if($(this).val().length == 0) {
            $("#headline").find("p").last().attr("id", "").html("So you don't want to be famous?");
        } else {
            $("#headline").find("p").last().attr("id", "authorname").html(strip_tags($(this).val()));
        }
    });

    $("#forkButton").click(function() {

        if(confirm("Do you want to copy this map so you can edit it?")) {
            var hexes = grid.getClasses();
            var authorName = ($.cookie("author") || "");
            var data = {
                fork:	true,
                forkid: $(this).data("id"),
                author: prompt("Enter your username:", authorName),
                theme: 	model.getThemeID(),
                fun: ($("#fun").is(":checked") ? 1 : 0),
                finished: ($("#unfinished").is(":checked") ? 0 : 1),
                fourplayer: ($("#2v2").is(":checked") ? 1 : 0),
                data:	hexes,
                pw:		prompt("Enter a password for editing:")
            }

            $.cookie('author', data.author, { expires: (365*10), path: '/' });

            if(spinner) spinner.spin(target);
            $.post("ajax/send.php", data, function(response) {
                var json = JSON.parse(response);

                if(spinner) spinner.stop();
                if(json.error) {
                    alert(json.errormessage);
                } else {
                    alert("This map has successfully been forked!");
                    replaceSendButton(json.maplink);
                }
            });
        }
    });

    $("#backBtn").click(function(){
        var lastMove = model.popMove();
        if(lastMove == null) return;
        grid.setClasses(lastMove, ctx);
    });

    $("#fwdBtn").click(function(){
        var replayMove = model.popForward();
        if(replayMove == null) return;
        grid.setClasses(replayMove, ctx);
    });


    $("#descriptiontext").dblclick(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if($("input#pw").val().length == 0) {
            showIssue($("input#pw"), "Enter your password first.");
        } else {
            $.post("ajax/get.php", {"checkpw": true, "pw": $("input#pw").val(), "id": thisMapID}, function(response) {
                var json = JSON.parse(response);
                if(json.error) {
                    alert(json.errormessage);
                    return;
                } else {
                    $("div#descriptiontext").html(json.description);

                    var $textarea = $("<textarea></textarea>");
                    $textarea.attr("id", "descriptiontext");
                    $textarea.attr("rows", "5");
                    $textarea.addClass("span3");
                    $textarea.val(json.description);
                    $("div#descriptiontext").remove();
                    $("div#palette").append($textarea);
                    showHint($textarea, (200-$textarea.val().length) + " characters remaining");
                    $textarea.keypress(function(e) {
                        if($(this).val().length >= 200) {
                            $(this).tooltip('destroy');
                            showHint($(this), "This thing is FULL!");
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            return;
                        }
                        $(this).tooltip('destroy');
                        showHint($(this), (200-$(this).val().length) + " characters remaining");
                    });
                }
            });
        }
    });

    $("#descriptiontext-edit").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if($("input#pw").val().length == 0) {
            showIssue($("input#pw"), "Enter your password first.");
        } else {
            $.post("ajax/get.php", {"checkpw": true, "pw": $("input#pw").val(), "id": thisMapID}, function(response) {
                var json = JSON.parse(response);
                if(json.error) {
                    alert(json.errormessage);
                    return;
                } else {
                    $("div#descriptiontext").html(json.description);

                    var $textarea = $("<textarea></textarea>");
                    $textarea.attr("id", "descriptiontext");
                    $textarea.attr("rows", "5");
                    $textarea.addClass("span3");
                    $textarea.val(json.description);
                    $("div#descriptiontext").remove();
                    $("div#palette").append($textarea);
                    showHint($textarea, (200-$textarea.val().length) + " characters remaining");
                    $textarea.keypress(function(e) {
                        if($(this).val().length >= 200) {
                            $(this).tooltip('destroy');
                            showHint($(this), "This thing is FULL!");
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            return;
                        }
                        $(this).tooltip('destroy');
                        showHint($(this), (200-$(this).val().length) + " characters remaining");
                    });
                }
            });
        }
    });

    $("#form").submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if($("input#mapname").length) {
            if($("input#mapname").val().length == 0) {
                showIssue($("input#mapname"), "Your map needs to have a name.");
            } else {
                if(checkName($("input#mapname").val())) {
                    if($("input#pw").val().length == 0 && $("input#mapname").length) {
                        if(confirm("Do you really want to leave the map unprotected?")) {
                            submitMap();
                        } else {
                            showIssue($("input#pw"), "Then enter a password, please.");
                        }
                    } else {
                        submitMap();
                    }
                } else {
                    showIssue($("input#mapname"), "So you deem this a 'useful' name? I don't.");
                }
            }
        } else {
            submitMap();
        }
        return false;
    });

    var showIssue = function($elem, message) {
            $elem.tooltip({title: message, trigger: "manual"}).tooltip('show');
            $elem.parent('div').addClass("error");
            $elem.focus();
            $elem.keyup(function() {
                $(this).parent('div').removeClass("error", 200);
                $(this).tooltip('destroy');
            });
        },

        showHint = function($elem, message) {
            $elem.tooltip({title: message, trigger: "manual"}).tooltip('show');
            $elem.blur(function() {
                $(this).tooltip('destroy');
            });
            $elem.focus();
        },

        getMapName = function() {
            if($("input#mapname").length) {
                return $("input#mapname").val();
            } else {
                return $("p#mapname").html();
            }
        },

        getAuthor = function() {
            if($("input#author").length) {
                return $("input#author").val();
            } else {
                $("p#authorname a").each(function() {
                    if($(this).attr("href").match(/author/)) {
                        return $(this).html();
                    }
                });
                return "";
            }
        },

        checkName = function(name) {
            if(name.length < 3 || name == "aaa" || name == "abc" || name == "asdf" || name.match(/^(T|t)est/)) {
                return false;
            }
            return true;
        },

        replaceSendButton = function(url) {
            $.cookie('own-map-' + thisMapID, true, { expires: (365*10), path: '/' });

            window.location.href = url + "/";
        },

        submitMap = function() {
            var hexes = grid.getClasses();
            var data = {
                save:	true,
                name: 	getMapName(),
                author: getAuthor(),
                theme: 	model.getThemeID(),
                data:	hexes,
                fun: ($("#fun").is(":checked") ? 1 : 0),
                finished: ($("#unfinished").is(":checked") ? 0 : 1),
                fourplayer: ($("#2v2").is(":checked") ? 1 : 0),
                pw:		"" + $("input#pw").val(),
                id: 	$("#pw").data("id"),
                description: getDescription()
            }

            $.cookie('author', "" + getAuthor(), { expires: (365*10), path: '/' });
            $("#form button").attr("disabled", "disabled");
            if(spinner) spinner.spin(target);
            $.post("ajax/send.php", data, function(response) {
                var json = JSON.parse(response);

                if(json.error) {
                    if(spinner) spinner.stop();
                    alert(json.errormessage);

                    $("#form button").removeAttr("disabled", 200);
                } else {
                    storeMapImage(function() {
                        if(spinner) spinner.stop();
                        alert("Your map has successfully been saved!");
                        replaceSendButton(json.maplink);
                    });
                }
            });
        },

        getDescription = function() {
            if(!$("textarea#descriptiontext").length) {
                return $("div#descriptiontext").html();
            } else {
                return $("textarea#descriptiontext").val().replace(/(\r\n\r\n|\n\n|\r\r)/gm,"\n").replace(/(\n\n)/gm,"\n").replace(/(\n\n)/gm,"\n").replace(/(\n\n)/gm,"\n").replace(/(\n\n)/gm,"\n");
            }
        }

    return {
        enableRating: enableRating
    };
})();