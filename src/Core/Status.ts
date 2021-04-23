/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { stat } from "fs";
import { Datas, System } from "..";
import { Constants, Enum, ScreenResolution } from "../Common";
import { Battler } from "./Battler";
import { Picture2D } from "./Picture2D";

/** @class
 *  A status affected to a player.
 *  @param {number} id - The ID of the status
 */
class Status {

    public system: System.Status;
    public turn: number;
    public picture: Picture2D;

    constructor(id: number, turn: number = 0) {
        this.system = Datas.Status.get(id);
        this.turn = turn;
        this.picture = Datas.Pictures.getPictureCopy(Enum.PictureKind.Icons, 
            this.system.pictureID);
    }

    /** 
     *  Get message and replace target name.
     *  @static
     *  @param {System.DynamicValue} message
     *  @param {Battler} target
     *  @returns {string}
     */
    static getMessage(message: System.DynamicValue, target: Battler): string {
        return message.getValue().replace("[target]", target.player.name);
    }

    /** 
     *  Draw the status on top of battler.
     *  @static
     *  @param {Status[]} statusList
     *  @param {number} x - The x position
     *  @param {number} y - The y position
     *  @param {Enum.Align} [align=Enum.Align.Left]
     */
    static drawList(statusList: Status[], x: number, y: number, align: Enum
        .Align = Enum.Align.Left) {
        let totalWidth: number = 0;
        let maxHeight: number = 0;
        let maxWidth: number = 0;
        let i: number, l: number, s: Status, h: number, w: number;
        for (let i = 0, l = statusList.length; i < l; i++) {
            totalWidth += statusList[i].picture.oW;
            w = statusList[i].picture.oW;
            if (w > maxWidth) {
                maxWidth = w;
            }
            h = statusList[i].picture.oH;
            if (h > maxHeight) {
                maxHeight = h;
            }
        }
        if (l > 1) {
            totalWidth += (l - 1) * Constants.MEDIUM_SPACE;
        }
        let xOffset: number = 0;
        switch (align) {
            case Enum.Align.Left:
                totalWidth = 0;
                break;
            case Enum.Align.Center:
                totalWidth /= 2;
                break;

        }
        for (i = 0, l = statusList.length; i < l; i++) {
            s = statusList[i];
            xOffset += s.picture.oW;
            s.draw(x - totalWidth + xOffset + (i * Constants.MEDIUM_SPACE) - 
                maxWidth, y - (maxHeight / 2));
        }
    }

    /** 
     *  Get message when ally affected.
     *  @param {Battler} target
     *  @returns {string}
     */
    getMessageAllyAffected(target: Battler): string {
        return Status.getMessage(this.system.messageAllyAffected, target);
    }

    /** 
     *  Get message when enemy affected.
     *  @param {Battler} target
     *  @returns {string}
     */
    getMessageEnemyAffected(target: Battler): string {
        return Status.getMessage(this.system.messageEnemyAffected, target);
    }

    /** 
     *  Get message when healed.
     *  @param {Battler} target
     *  @returns {string}
     */
    getMessageHealed(target: Battler): string {
        return Status.getMessage(this.system.messageStatusHealed, target);
    }

    /** 
     *  Get message when still affected.
     *  @param {Battler} target
     *  @returns {string}
     */
    getMessageStillAffected(target: Battler): string {
        return Status.getMessage(this.system.messageStatusStillAffected, target);
    }

    /** 
     *  Draw the status on top of battler.
     *  @param {number} x - The x position
     *  @param {number} y - The y position
     */
    draw(x: number, y: number) {
        this.picture.draw(x, y);
    }
}

export { Status }