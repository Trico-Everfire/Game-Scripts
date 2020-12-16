/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { Base } from "./Base";
import { System, Manager } from "..";
import { MapObject } from "../Core";
import { Mathf, Utils } from "../Common";

/** @class
 *  An event command for changing a property value.
 *  @extends EventCommand.Base
 *  @property {System.DynamicValue} propertyID The property ID value
 *  @property {OperationKind} operationKind The operation kind
 *  @property {System.DynamicValue} newValue The new value
 *  @param {any[]} command Direct JSON command to parse
*/
class ChangeProperty extends Base {

    public propertyID: System.DynamicValue;
    public operationKind: number;
    public newValue: System.DynamicValue;

    constructor(command: any[]) {
        super();

        let iterator = {
            i: 0
        }
        this.propertyID = System.DynamicValue.createValueCommand(command, 
            iterator);
        this.operationKind = command[iterator.i++];
        this.newValue = System.DynamicValue.createValueCommand(command, iterator);
    }

    /** 
     *  Update and check if the event is finished.
     *  @param {Record<string, any>} currentState The current state of the event
     *  @param {MapObject} object The current object reacting
     *  @param {number} state The state ID
     *  @returns {number} The number of node to pass
    */
    update(currentState: Record<string, any>, object: MapObject, state: number): 
        number
    {
        let propertyID = this.propertyID.getValue();
        let newValue = Mathf.OPERATORS_NUMBERS[this.operationKind](object
            .properties[propertyID], this.newValue.getValue());
        object.properties[propertyID] = newValue;
        let props: number[];
        if (object.isHero) {
            props = Manager.Stack.game.heroProperties;
        } else if (object.isStartup) {
            props = Manager.Stack.game.startupProperties[Manager.Stack
                .currentMap.id];
            if (Utils.isUndefined(props)) {
                props = [];
                Manager.Stack.game.startupProperties[Manager.Stack.currentMap.id
                    ] = props;
            }
        } else {
            let portion = Manager.Stack.currentMap.allObjects[object.system.id]
                .getGlobalPortion();
            let portionDatas = Manager.Stack.game.getPotionsDatas(Manager.Stack
                .currentMap.id, portion);
            let indexProp = portionDatas.pi.indexOf(object.system.id);
            if (indexProp === -1) {
                props = [];
                portionDatas.pi.push(object.system.id);
                portionDatas.p.push(props);
            } else {
                props = portionDatas.p[indexProp];
            }
        }
        props[propertyID - 1] = newValue;
        return 1;
    }
}

export { ChangeProperty }