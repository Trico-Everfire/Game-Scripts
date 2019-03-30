/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

// -------------------------------------------------------
//
//  CLASS SystemProgressionTable
//
// -------------------------------------------------------

/** @class
*   A progression table
*/
function SystemProgressionTable(id) {
    if (id) {
        this.id = id;
    }
}

SystemProgressionTable.createProgression = function(i, f, equation) {
    var progression = new SystemProgressionTable();
    progression.initialize(i, f, equation);
    return progression;
};

SystemProgressionTable.prototype = {

    initialize: function(i, f, equation) {
        if (typeof i === 'number') {
            i = SystemValue.createNumber(i);
        }
        if (typeof f === 'number') {
            f = SystemValue.createNumber(f);
        }

        this.initialValue = i;
        this.finalValue = f;
        this.equation = equation;
        this.table = [];
    },

    /** Read the JSON associated to the picture.
    *   @param {Object} json Json object describing the object.
    */
    readJSON: function(json){
        this.initialValue = new SystemValue();
        this.initialValue.read(json.i);
        this.finalValue = new SystemValue();
        this.finalValue.read(json.f);
        this.equation = json.e;
        this.table = {};
        var jsonTable = json.t;
        var i, l;
        if (jsonTable) {
            for (i = 0, l = jsonTable.length; i < l; i++) {
                this.table[jsonTable[i].k] = jsonTable[i].v;
            }
        }
    },

    // -------------------------------------------------------

    getProgressionAt: function(current, f) {
        // Check if specific value
        var table = this.table[current];
        if (table) {
            return table;
        }

        // Update change and duration
        this.start = this.initialValue.getValue();
        this.change = this.finalValue.getValue() - this.initialValue.getValue();
        this.duration = f - 1;

        // Check according to equation
        var x = current - 1;
        switch (this.equation) {
        case 0:
            return this.easingLinear(x);
        case -1:
            return this.easingQuadraticIn(x);
        case 1:
            return this.easingQuadraticOut(x);
        case -2:
            return this.easingCubicIn(x);
        case 2:
            return this.easingCubicOut(x);
        case -3:
            return this.easingQuarticIn(x);
        case 3:
            return this.easingQuarticOut(x);
        case -4:
            return this.easingQuinticIn(x);
        case 4:
            return this.easingQuinticOut(x);
        default:
            return 0;
        }
    },

    // -------------------------------------------------------

    easingLinear: function(x) {
        return Math.floor(this.change * x / this.duration + this.start);
    },

    // -------------------------------------------------------

    easingQuadraticIn: function(x) {
        x /= this.duration;
        return Math.floor(this.change * x * x + this.start);
    },

    // -------------------------------------------------------

    easingQuadraticOut: function(x) {
        x /= this.duration;
        return Math.floor(-this.change * x * (x - 2) + this.start);
    },

    // -------------------------------------------------------

    easingCubicIn: function(x) {
        x /= this.duration;
        return Math.floor(this.change * x * x * x + this.start);
    },

    // -------------------------------------------------------

    easingCubicOut: function(x) {
        x /= this.duration;
        x--;
        return Math.floor(this.change * (x * x * x + 1) + this.start);
    },

    // -------------------------------------------------------

    easingQuarticIn: function(x) {
        x /= this.duration;
        return Math.floor(this.change * x * x * x * x + this.start);
    },

    // -------------------------------------------------------

    easingQuarticOut: function(x) {
        x /= this.duration;
        x--;
        return Math.floor(-this.change * (x * x * x * x - 1) + this.start);
    },

    // -------------------------------------------------------

    easingQuinticIn: function(x) {
        x /= this.duration;
        return Math.floor(this.change * x * x * x * x * x + this.start);
    },

    // -------------------------------------------------------

    easingQuinticOut: function(x) {
        x /= this.duration;
        x--;
        return Math.floor(this.change * (x * x * x * x * x + 1) + this.start);
    }
}
