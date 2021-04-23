/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { Battler } from ".";
import { Datas, System } from "..";
import { Enum } from "../Common";
import { Picture2D } from "./Picture2D";

/** @class
 *  An animation instance.
 *  @param {number} id - The ID of the status
 */
class Animation {

    public system: System.Animation;
    public picture: Picture2D;
    public frame: number;
    public loop: boolean;

    constructor(id: number, loop: boolean = false) {
        this.system = Datas.Animations.get(id);
        if (this.system) {
            this.picture = Datas.Pictures.getPictureCopy(Enum.PictureKind.Animations, 
                this.system.pictureID);
            this.frame = 0;
            this.loop = loop;
        }
    }

    /** 
     *  Update frame.
     */
    update() {
        this.frame++;
        if (this.loop) {
            this.frame = this.frame % this.system.frames.length;
        }
    }

    /** 
     *  Draw the animation on top of battler.
     */
    playSounds(conditionKind: Enum.AnimationEffectConditionKind) {
        if (this.system) {
            this.system.playSounds(this.frame, conditionKind);
        }
    }

    /** 
     *  Draw the animation on top of battler.
     */
    draw(battler: Battler) {
        if (this.system) {
            this.system.draw(this.picture, this.frame, battler);
        }
    }
}

export { Animation }