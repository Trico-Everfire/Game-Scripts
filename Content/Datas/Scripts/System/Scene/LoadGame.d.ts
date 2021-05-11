import { SaveLoadGame } from "./SaveLoadGame.js";
import { Picture2D } from "../Core/index.js";
/** @class
 *  A scene in the menu for loading a game.
 *  @extends Scene.SaveLoadGame
 */
declare class LoadGame extends SaveLoadGame {
    pictureBackground: Picture2D;
    constructor();
    /**
     *  Load async stuff.
     */
    load(): Promise<void>;
    loadGame(): Promise<void>;
    /**
     *  Handle scene key pressed
     *  @param {number} key - The key ID
     */
    onKeyPressed(key: number): void;
    /**
     *  Draw the HUD scene
     */
    drawHUD(): void;
}
export { LoadGame };
