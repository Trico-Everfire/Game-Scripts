import { System } from "../index.js";
import { Base } from "./Base.js";
interface StructTroopElement {
    id: number;
    level: number;
}
/** @class
 *  A troop of the game.
 *  @extends System.Base
 *  @param {Record<string, any>} - [json=undefined] Json object describing the
 *  troop
 */
declare class Troop extends Base {
    list: StructTroopElement[];
    reactions: System.TroopReaction[];
    constructor(json?: Record<string, any>);
    /**
     *  Read the JSON associated to the troop.
     *  @param {Record<string, any>} - json Json object describing the troop
     */
    read(json: Record<string, any>): void;
}
export { StructTroopElement, Troop };
