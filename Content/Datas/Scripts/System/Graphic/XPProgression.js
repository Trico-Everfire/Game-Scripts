/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { Base } from "./Base.js";
import { Graphic } from "../index.js";
import { Game } from "../Core/index.js";
/** @class
 *  The graphic displaying all the progression for each character.
 *  @extends Graphic.Base
*/
class XPProgression extends Base {
    constructor() {
        super();
        let l = Game.current.teamHeroes.length;
        this.graphicCharacters = new Array(l);
        for (let i = 0; i < l; i++) {
            this.graphicCharacters[i] = new Graphic.Player(Game.current
                .teamHeroes[i]);
        }
    }
    /**
     *  Update graphics experience.
     */
    updateExperience() {
        for (let i = 0, l = Game.current.teamHeroes.length; i < l; i++) {
            this.graphicCharacters[i].updateExperience();
        }
    }
    /**
     *  Drawing the progression.
     *  @param {number} x - The x position to draw graphic
     *  @param {number} y - The y position to draw graphic
     *  @param {number} w - The width dimention to draw graphic
     *  @param {number} h - The height dimention to draw graphic
    */
    drawChoice(x, y, w, h) {
        this.draw(x, y, w, h);
    }
    /**
     *  Drawing the progression.
     *  @param {number} x - The x position to draw graphic
     *  @param {number} y - The y position to draw graphic
     *  @param {number} w - The width dimention to draw graphic
     *  @param {number} h - The height dimention to draw graphic
    */
    draw(x, y, w, h) {
        for (let i = 0, l = this.graphicCharacters.length; i < l; i++) {
            this.graphicCharacters[i].drawChoice(x, y + (i * 90), w, 85);
        }
    }
}
export { XPProgression };
