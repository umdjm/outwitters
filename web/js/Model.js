MapEditor.Model = (function() {
    var
        themes = ["scallywags", "feedback", "adorables", "veggienauts"],
        currentTheme = 0,
        selectedClass = "t1",
        moveStartHex = null,
        selectedUnit = "",
        selectedHealth = "health3",
        selectedColor = "blue",
        selectedPlayerRaces = ["scallywags", "scallywags", "scallywags", "scallywags"],
        playerColors = ["blue", "red", "green", "yellow"],
        currentBase = 1,
        moveMode = false,
        moveQueue = [],
        forwardMoveQueue = [],


        getClass = function() {
            return selectedClass + getColor();
        },

        setClass = function(newClass) {
            selectedClass = newClass;
            selectedUnit = "";
        },

        getTheme = function() {
            return themes[currentTheme];
        },

        getThemeID = function() {
            return currentTheme;
        },

        setTheme = function(id) {
            currentTheme = id;
        },

        swapTheme = function() {
            currentTheme++;
            if(currentTheme > 3) currentTheme = 0;
        },

        setSelectedPlayerRace = function(id) {
            var playerIndex = playerColors.indexOf(selectedColor);
            selectedPlayerRaces[playerIndex] = id;
        },

        getSelectedPlayerRace = function() {
            var playerIndex = playerColors.indexOf(selectedColor);
            return selectedPlayerRaces[playerIndex];
        },

        setMoveMode = function(input){
            moveMode = (input == true);
        },
        isMoveMode = function(){
            return moveMode;
        },

        setMoveStartHex = function(hex){
            moveStartHex = hex;
        },

        getMoveStartHex = function(){
            return moveStartHex;
        },

        getCurrentPlayerNum = function(){
            return playerColors.indexOf(selectedColor);
        },

        getPlayerRace = function(id){
            return selectedPlayerRaces[id];
        },

        getColor = function() {
            if(selectedUnit == "rmv") {
                return "";
            } if(selectedUnit != "") {
                return selectedColor;
            } else if(selectedClass.match(/^(b|s)$/)) {
                return selectedColor;
            } else {
                // color does not matter and would cause 404
                return "";
            }
        },

        setColor = function(color) {
            selectedColor = color;
        },

        getUnit = function() {
            return (selectedUnit == "" ? false : selectedUnit + getColor());
        },

        getSelectedUnit = function() {
            return selectedUnit;
        }

        getHealth = function() {
            return selectedHealth;
        },

        setUnit = function(newUnit) {
            selectedUnit = newUnit;
            //selectedClass = "";
        },

        setHealth = function(newHealth) {
            selectedHealth = newHealth;
        },

        rmvUnit = function() {
            selectedUnit = "";
        },

        getBase = function() {
            return currentBase;
        },
        popMove = function(){
            if(moveQueue.length == 0) return null;
            forwardMoveQueue.push(grid.getClasses());
            return moveQueue.pop();
        },
        pushMove = function(move){
            moveQueue.push(move);
            forwardMoveQueue = [];
        },
        popForward = function(){
            if(forwardMoveQueue.length == 0) return null;
            moveQueue.push(grid.getClasses());
            return forwardMoveQueue.pop();
        };


    return {
        getClass: getClass,
        setClass: setClass,
        getTheme: getTheme,
        getThemeID: getThemeID,
        setTheme: setTheme,
        setColor: setColor,
        getColor: getColor,
        swapTheme: swapTheme,
        setSelectedPlayerRace: setSelectedPlayerRace,
        getSelectedPlayerRace: getSelectedPlayerRace,
        getCurrentPlayerNum: getCurrentPlayerNum,
        getPlayerRace: getPlayerRace,
        getUnit: getUnit,
        getSelectedUnit: getSelectedUnit,
        setUnit: setUnit,
        rmvUnit: rmvUnit,
        getHealth: getHealth,
        setHealth: setHealth,
        getBase: getBase,
        setMoveMode: setMoveMode,
        isMoveMode: isMoveMode,
        setMoveStartHex: setMoveStartHex,
        getMoveStartHex: getMoveStartHex,
        pushMove: pushMove,
        popMove: popMove,
        popForward: popForward,
        isBaseSelected: function() { return selectedClass.match(/^b$/); }
    }
})();