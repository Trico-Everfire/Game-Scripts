/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { Enum, Utils, Interpreter } from "../Common";
import DamagesKind = Enum.DamagesKind;
import { Base } from "./Base";
import { DynamicValue } from "./DynamicValue";
import { Manager, Datas, Scene } from "../index";
import { Player, Game } from "../Core";

/** @class
 *  A cost of a common skill item.
 *  @extends System.Base
 *  @param {Record<string, any>} - [json=undefined] Json object describing the 
 *  cost
 */
class Cost extends Base {

    public kind: number;
    public statisticID: DynamicValue;
    public currencyID: DynamicValue;
    public variableID: number;
    public valueFormula: DynamicValue;

    constructor(json?: Record<string, any>) {
        super(json);
    }

    /** 
     *  Read the JSON associated to the cost.
     *  @param {Record<string, any>} - json Json object describing the cost
     */
    read(json: Record<string, any>) {
        this.kind = Utils.defaultValue(json.k, DamagesKind.Stat);
        switch (this.kind) {
            case DamagesKind.Stat:
                this.statisticID = DynamicValue.readOrDefaultDatabase(json.sid);
                break;
            case DamagesKind.Currency:
                this.currencyID = DynamicValue.readOrDefaultDatabase(json.cid);
                break;
            case DamagesKind.Variable:
                this.variableID = Utils.defaultValue(json.vid, 1);
                break;
        }
        this.valueFormula = DynamicValue.readOrDefaultMessage(json.vf);
    }

    /** 
     *  Use the cost.
     */
    use() {
        let user = Scene.Map.current.user ? Scene.Map.current.user.player : 
            Player.getTemporaryPlayer();
        let target = Player.getTemporaryPlayer();
        let value = Interpreter.evaluate(this.valueFormula.getValue(), { user: 
            user, target: target });
        switch (this.kind) {
            case DamagesKind.Stat:
                user[Datas.BattleSystems.getStatistic(this.statisticID
                    .getValue()).abbreviation] -= value;
                break;
            case DamagesKind.Currency:
                Game.current.currencies[this.currencyID.getValue()] -= 
                    value;
                break;
            case DamagesKind.Variable:
                Game.current.variables[this.variableID] -= value;
                break;
        }
    }

    /** 
     *  Check if the cost is possible.
     *  @returns {boolean}
     */
    isPossible(): boolean {
        let user = Scene.Map.current.user ? Scene.Map.current.user
            .player : Player.getTemporaryPlayer();
        let target = Player.getTemporaryPlayer();
        let value = Interpreter.evaluate(this.valueFormula.getValue(), { user: 
            user, target: target });
        let currentValue: number;
        switch (this.kind) {
            case DamagesKind.Stat:
                currentValue = user[Datas.BattleSystems.getStatistic(this
                    .statisticID.getValue()).abbreviation];
                break;
            case DamagesKind.Currency:
                currentValue = Game.current.getCurrency(this.currencyID
                    .getValue());
                break;
            case DamagesKind.Variable:
                currentValue = Game.current.getVariable(this.variableID);
                break;
        }
        return (currentValue - value >= 0);
    }

    /** 
     *  Get the string representing the cost.
     *  @returns {string}
     */
    toString(): string {
        let user = Scene.Map.current.user ? Scene.Map.current.user
            .player : Player.getTemporaryPlayer();
        let target = Player.getTemporaryPlayer();
        let result = Interpreter.evaluate(this.valueFormula.getValue(), { user: 
            user, target: target }) + " ";
        switch (this.kind) {
            case DamagesKind.Stat:
                result += Datas.BattleSystems.getStatistic(this.statisticID
                    .getValue()).name;
                break;
            case DamagesKind.Currency:
                result += Datas.Systems.getCurrency(this.currencyID.getValue())
                    .name;
                break;
            case DamagesKind.Variable:
                result += Datas.Variables.get(this.variableID);
                break;
        }
        return result;
    }
}

export { Cost }