MapEditor.View = (function() {
    var
        model = MapEditor.Model,
        eraseOnDrag = false,
        mousedown = false,
        themeChanging = false;

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

    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr("title");
 
        // Show/Hide Tabs
        $(".tab").each(function() {
            $(this).hide();
            $(this).removeClass("active");
        });

        $("#" + currentAttrValue).show();
        $("#" + currentAttrValue).addClass("active");
        
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
        model.setUnit($(this).attr("id"));
        $(".unit.selected, .terrain.selected").removeClass("selected");
        $(this).addClass("selected");
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

        if(!hex) return;

        if(model.isBaseSelected() && !model.getUnit()) {
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
            if(model.isMoveMode()) {
                if(hex.unitClass != ""){
                    model.setMoveStartHex(hex);
                } else if(model.getMoveStartHex() != null) {
                    var oldHex = model.getMoveStartHex();
                    hex.unitClass = oldHex.unitClass;
                    hex.health = oldHex.health;
                    oldHex.unitClass = "";
                    oldHex.health = "";
                    oldHex.updateImage();
                }
            }
            else if(model.getUnit()) {
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
                    hex.health = MapEditor.Model.getHealth();
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