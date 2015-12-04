MapEditor.Model = (function() {
    var
        themes = ["scallywags", "feedback", "adorables", "veggienauts"],
        currentTheme = 0,
        selectedClass = "t1",
        selectedUnit = "",
        selectedColor = "blue",
        selectedTheme = "scallywags",
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

        setCurrentTheme = function(id) {
            selectedTheme = id;
        },

        getCurrentTheme = function(id) {
            return selectedTheme;
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

        setUnit = function(newUnit) {
            selectedUnit = newUnit;
            //selectedClass = "";
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
        swapTheme: swapTheme,
        getUnit: getUnit,
        setUnit: setUnit,
        rmvUnit: rmvUnit,
        getBase: getBase,
        isBaseSelected: function() { return selectedClass.match(/^b$/); }
    }
})();