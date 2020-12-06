/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { Base } from "./Base";
import { System } from "..";
import { WindowBox } from "../Core";

/** @class
*   An event command for displaying text
*   @extends EventCommand.Base
*   @property {SystemValue} interlocutor The interlocutor text value
*   @property {number} facesetID The faceset ID
*   @property {string} message The message to parse
*   @property {WindowBox} windowMain Window containing the message to display
*   @property {WindowBox} windowInterlocutor Window containing the interlocutor 
*   to display
*   @param {any[]} command Direct JSON command to parse
*/
class ShowText extends Base {

    public interlocutor: System.DynamicValue;
    public facesetID: number;
    public message: string;
    public windowMain: WindowBox;
    public windowInterlocutor: WindowBox;

    constructor(command: any[])
    {
        super();

        let iterator = {
            i: 0
        }
        this.interlocutor = System.DynamicValue.createValueCommand(command, iterator);
        this.facesetID = command[iterator.i++];
        this.message = command[iterator.i++];
        this.windowMain = new WindowBox(0, 0, 0, 0,
            {
                content: new GraphicMessage(RPM.numToString(this.message), this
                    .facesetID),
                padding: RPM.HUGE_PADDING_BOX
            }
        );
        this.windowInterlocutor = new WindowBox(this.windowMain.oX + (RPM
            .MEDIUM_SLOT_HEIGHT / 2), this.windowMain.oY - (RPM
            .MEDIUM_SLOT_HEIGHT / 2), RPM.MEDIUM_SLOT_WIDTH, RPM
            .MEDIUM_SLOT_HEIGHT,
            {
                content: new GraphicText(RPM.STRING_EMPTY, { align: Align.Center }),
                padding: RPM.SMALL_SLOT_PADDING
            }
        );
        this.isDirectNode = false;
    }

    // -------------------------------------------------------
    /** Initialize the current state
    *   @returns {Object} The current state
    */
    initialize()
    {
        this.windowMain.setX(RPM.defaultValue(RPM.datasGame.system.dbOptions.vx,
            0));
        this.windowMain.setY(RPM.defaultValue(RPM.datasGame.system.dbOptions.vy,
            0));
        this.windowMain.setW(RPM.defaultValue(RPM.datasGame.system.dbOptions.vw,
            0));
        this.windowMain.setH(RPM.defaultValue(RPM.datasGame.system.dbOptions.vh,
            0));
        this.windowInterlocutor.setX(this.windowMain.oX + (RPM
            .MEDIUM_SLOT_HEIGHT / 2));
        this.windowInterlocutor.setY(this.windowMain.oY - (RPM
            .MEDIUM_SLOT_HEIGHT / 2));
        this.windowMain.padding[0] = RPM.defaultValue(RPM.datasGame.system
            .dbOptions.vpLeft, 0);
        this.windowMain.padding[1] = RPM.defaultValue(RPM.datasGame.system
            .dbOptions.vpTop, 0);
        this.windowMain.padding[2] = RPM.defaultValue(RPM.datasGame.system
            .dbOptions.vpRight, 0);
        this.windowMain.padding[3] = RPM.defaultValue(RPM.datasGame.system
            .dbOptions.vpBottom, 0);
        this.windowMain.updateDimensions();
        this.windowMain.content.update();
        this.windowInterlocutor.content.setText(this.interlocutor.getValue());
        return {
            clicked: false,
            frame: 0,
            frameTick: 0,
            frameDuration: 150
        }
    }

    // -------------------------------------------------------
    /** Update and check if the event is finished
    *   @param {Object} currentState The current state of the event
    *   @param {MapObject} object The current object reacting
    *   @param {number} state The state ID
    *   @returns {number} The number of node to pass
    */
    update(currentState, object, state)
    {
        if (currentState.clicked)
        {
            return 1;
        }
        currentState.frameTick += RPM.elapsedTime;
        if (currentState.frameTick >= currentState.frameDuration)
        {
            currentState.frame = (currentState.frame + 1) % RPM.FRAMES;
            currentState.frameTick = 0;
            RPM.requestPaintHUD = true;
        }
        this.windowInterlocutor.content.setText(this.interlocutor.getValue());
        return 0;
    }

    // -------------------------------------------------------
    /** First key press handle for the current stack
    *   @param {Object} currentState The current state of the event
    *   @param {number} key The key ID pressed
    */
    onKeyPressed(currentState, key)
    {
        if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
            .Action))
        {
            currentState.clicked = true;
        }
    }

    // -------------------------------------------------------
    /** Draw the HUD
    *   @param {Object} currentState The current state of the event
    */
    drawHUD(currentState)
    {
        this.windowMain.draw();
        if (this.windowInterlocutor.content.text)
        {
            this.windowInterlocutor.draw();
        }
        if (currentState)
        {
            RPM.datasGame.system.getWindowSkin().drawArrowMessage(currentState
                .frame, this.windowMain.oX + (this.windowMain.oW / 2), this
                .windowMain.oY + (this.windowMain.oH - 40));
        }
    }
}