/*
    RPG Paper Maker Copyright (C) 2017-2019 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

// -------------------------------------------------------
//
//  CLASS GraphicUseSkillItem
//
// -------------------------------------------------------

/** @class
*/
function GraphicUserSkillItem() {
    var player;

    this.graphicCharacters = new Array;
    for (var i = 0, l = $game.teamHeroes.length; i < l; i++) {
        player = new GraphicPlayer($game.teamHeroes[i]);
        player.initializeCharacter(true);
        this.graphicCharacters.push(player);
    }
    this.setAll(false);
}

GraphicUserSkillItem.prototype = {

    setAll: function(b) {
        this.all = b;

        if (b) {
            var i, l;

            l = $game.teamHeroes.length;
            $currentMap.targets = new Array(l);
            for (i = 0; i < l; i++) {
                $currentMap.targets[i] = $game.teamHeroes[i];
            }
        } else {
            this.indexArrow = 0;
            $currentMap.targets = [$game.teamHeroes[this.indexArrow]];
        }
    },

    // -------------------------------------------------------

    update: function() {
        for (var i = 0, l = this.graphicCharacters.length; i < l; i++) {
            this.graphicCharacters[i].updateBattler();
        }
    },

    // -------------------------------------------------------

    updateStats: function() {
        for (var i = 0, l = this.graphicCharacters.length; i < l; i++) {
            this.graphicCharacters[i].update();
        }
    },

    // -------------------------------------------------------

    goLeft: function() {
        this.moveArrow(this.indexArrow - 1);
    },

    // -------------------------------------------------------

    goRight: function() {
        this.moveArrow(this.indexArrow + 1);
    },

    // -------------------------------------------------------

    moveArrow: function(index) {
        if (!this.isAll) {
            this.indexArrow = RPM.mod(index, this.graphicCharacters.length);
            $currentMap.targets = [$game.teamHeroes[this.indexArrow]];
            $requestPaintHUD = true;
        }
    },

    // -------------------------------------------------------

    onKeyPressedAndRepeat: function(key) {
        if (DatasKeyBoard.isKeyEqual(key, $datasGame.keyBoard.menuControls.Right))
        {
            this.goRight();
        } else if (DatasKeyBoard.isKeyEqual(key, $datasGame.keyBoard
            .menuControls.Left))
        {
            this.goLeft();
        }
    },

    // -------------------------------------------------------

    drawArrowAtIndex: function(index, x, y, h) {
        $datasGame.system.getWindowSkin().drawArrowTarget(this.graphicCharacters
            [index].battlerFrame, x + 32 + (index * 85), y + h - 20);
    },

    // -------------------------------------------------------

    /** Drawing the save informations.
    *   @param {number} x The x position to draw graphic.
    *   @param {number} y The y position to draw graphic.
    *   @param {number} w The width dimention to draw graphic.
    *   @param {number} h The height dimention to draw graphic.
    */
    drawInformations: function(x, y, w, h) {
        var i, l;

        for (i = 0, l = this.graphicCharacters.length; i < l; i++) {
            this.graphicCharacters[i].drawCharacter(x + 5 + (i * 85), y - 32, w,
                h);
        }
        if (this.all) {
            for (i = 0; i < l; i++) {
                this.drawArrowAtIndex(i, x, y, h);
            }
        } else {
            this.drawArrowAtIndex(this.indexArrow, x, y, h);
        }
    }
}
