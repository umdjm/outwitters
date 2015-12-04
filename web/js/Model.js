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

        isMoveMode = function(){
            return true;
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
        setUnit: setUnit,
        rmvUnit: rmvUnit,
        getHealth: getHealth,
        setHealth: setHealth,
        getBase: getBase,
        isMoveMode: isMoveMode,
        setMoveStartHex: setMoveStartHex,
        getMoveStartHex: getMoveStartHex,
        isBaseSelected: function() { return selectedClass.match(/^b$/); }
    }
})();