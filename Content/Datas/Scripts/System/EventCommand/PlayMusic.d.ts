import { Base } from "./Base.js";
import { System } from "../index.js";
import { Enum } from "../Common/index.js";
import SongKind = Enum.SongKind;
import { MapObject } from "../Core/index.js";
/** @class
 *  An event command for playing a music.
 *  @extends EventCommand.Base
 *  @param {any[]} command - Direct JSON command to parse
 */
declare class PlayMusic extends Base {
    song: System.PlaySong;
    constructor(command: any[]);
    /**
     *  Parse a play song command.
     *  @static
     *  @param {any} that - The event command to parse
     *  @param {any[]} command - Direct JSON command to parse
     *  @param {SongKind} kind - The song kind
     */
    static parsePlaySong(that: any, command: any[], kind: SongKind): void;
    /**
     *  Initialize the current state.
     *  @returns {Record<string, any>} The current state
     */
    initialize(): Record<string, any>;
    /**
     *  Update and check if the event is finished.
     *  @param {Record<string, any>} - currentState The current state of the event
     *  @param {MapObject} object - The current object reacting
     *  @param {number} state - The state ID
     *  @returns {number} The number of node to pass
    */
    update(currentState: Record<string, any>, object: MapObject, state: number): number;
}
export { PlayMusic };
