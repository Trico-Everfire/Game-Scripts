/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { System } from "..";
import { Utils } from "../Common";
import { Base } from "./Base";

interface StructTroopElement {
    id: number,
    level: number
}

/** @class
 *  A troop of the game.
 *  @extends System.Base
 *  @param {Record<string, any>} - [json=undefined] Json object describing the 
 *  troop
 */
class Troop extends Base {

    public list: StructTroopElement[];
    public reactions: System.TroopReaction[];

    constructor(json?: Record<string, any>) {
        super(json);
    }

    /** 
     *  Read the JSON associated to the troop.
     *  @param {Record<string, any>} - json Json object describing the troop
     */
    read(json: Record<string, any>) {
        let jsonList = Utils.defaultValue(json.l, []);
        let l = jsonList.length;
        this.list = new Array(l);
        let jsonElement: Record<string, any>;
        for (let i = 0; i < l; i++) {
            jsonElement = jsonList[i];
            this.list[i] = {
                id: jsonElement.id,
                level: jsonElement.l
            };
        }
        this.reactions = [];
        Utils.readJSONSystemList({ list: Utils.defaultValue(json.reactions, []), 
            listIndexes: this.reactions, cons: System.TroopReaction });
    }
}

export { StructTroopElement, Troop }