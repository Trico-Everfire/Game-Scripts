/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { Base } from "./Base.js";
import { Utils, Enum, Constants, Interpreter, Mathf } from "../Common/index.js";
var EffectKind = Enum.EffectKind;
var DamagesKind = Enum.DamagesKind;
var EffectSpecialActionKind = Enum.EffectSpecialActionKind;
var CharacterKind = Enum.CharacterKind;
import { System, Manager, Datas, Scene } from "../index.js";
import { Player, ReactionInterpreter, Game } from "../Core/index.js";
/** @class
 *  An effect of a common skill item.
 *  @extends System.Base
 *  @param {Record<string, any>} - [json=undefined] Json object describing the
 *  effect
 */
class Effect extends Base {
    constructor(json) {
        super(json);
    }
    /**
     *  Read the JSON associated to the effect.
     *  @param {Record<string, any>} - json Json object describing the effect
     */
    read(json) {
        this.kind = Utils.defaultValue(json.k, EffectKind.Damages);
        switch (this.kind) {
            case EffectKind.Damages: {
                this.damageKind = Utils.defaultValue(json.dk, DamagesKind.Stat);
                switch (this.damageKind) {
                    case DamagesKind.Stat:
                        this.damageStatisticID = System.DynamicValue
                            .readOrDefaultDatabase(json.dsid);
                        break;
                    case DamagesKind.Currency:
                        this.damageCurrencyID = System.DynamicValue
                            .readOrDefaultDatabase(json.dcid);
                        break;
                    case DamagesKind.Variable:
                        this.damageVariableID = Utils.defaultValue(json.dvid, 1);
                        break;
                }
                this.damageFormula = System.DynamicValue.readOrDefaultMessage(json.df);
                this.isDamagesMinimum = Utils.defaultValue(json.idmin, true);
                this.damagesMinimumFormula = System.DynamicValue
                    .readOrDefaultMessage(json.dmin, Constants.STRING_ZERO);
                this.isDamagesMaximum = Utils.defaultValue(json.idmax, false);
                this.damagesMaximumFormula = System.DynamicValue
                    .readOrDefaultMessage(json.dmax, Constants.STRING_ZERO);
                this.isDamageElement = Utils.defaultValue(json.ide, false);
                this.damageElementID = System.DynamicValue.readOrDefaultDatabase(json.deid);
                this.isDamageVariance = Utils.defaultValue(json.idv, false);
                this.damageVarianceFormula = System.DynamicValue
                    .readOrDefaultMessage(json.dvf, Constants.STRING_ZERO);
                this.isDamageCritical = Utils.defaultValue(json.idc, false);
                this.damageCriticalFormula = System.DynamicValue
                    .readOrDefaultMessage(json.dcf, Constants.STRING_ZERO);
                this.isDamagePrecision = Utils.defaultValue(json.idp, false);
                this.damagePrecisionFormula = System.DynamicValue
                    .readOrDefaultMessage(json.dpf, Utils.numToString(100));
                this.isDamageStockVariableID = Utils.defaultValue(json.idsv, false);
                this.damageStockVariableID = Utils.defaultValue(json.dsv, 1);
                break;
            }
            case EffectKind.Status:
                this.isAddStatus = Utils.defaultValue(json.iast, true);
                this.statusID = System.DynamicValue.readOrDefaultDatabase(json
                    .sid);
                this.statusPrecisionFormula = System.DynamicValue
                    .readOrDefaultMessage(json.spf, Utils.numToString(100));
                break;
            case EffectKind.AddRemoveSkill:
                this.isAddSkill = Utils.defaultValue(json.iask, true);
                this.addSkillID = System.DynamicValue.readOrDefaultDatabase(json
                    .asid);
                break;
            case EffectKind.PerformSkill:
                this.performSkillID = System.DynamicValue.readOrDefaultDatabase(json.psid);
                break;
            case EffectKind.CommonReaction:
                this.commonReaction = (Utils
                    .isUndefined(json.cr) ? null : Manager.Events
                    .getEventCommand(json.cr));
                break;
            case EffectKind.SpecialActions:
                this.specialActionKind = Utils.defaultValue(json.sak, EffectSpecialActionKind.ApplyWeapons);
                break;
            case EffectKind.Script:
                this.scriptFormula = System.DynamicValue.readOrDefaultMessage(json.sf);
                break;
        }
        this.isTemporarilyChangeTarget = Utils.defaultValue(json.itct, false);
        this.temporarilyChangeTargetFormula = System.DynamicValue
            .readOrDefaultMessage(json.tctf);
    }
    /**
     *  Execute the effect.
     *  @returns {boolean}
     */
    execute() {
        let user = Scene.Map.current.user ? Scene.Map.current.user.player :
            Player.getTemporaryPlayer();
        Scene.Map.current.tempTargets = Scene.Map.current.targets;
        if (this.isTemporarilyChangeTarget) {
            Scene.Map.current.targets = Interpreter.evaluate(this
                .temporarilyChangeTargetFormula.getValue(), { user: user });
        }
        let targets = Scene.Map.current.targets;
        let result = false;
        let l = targets.length;
        switch (this.kind) {
            case EffectKind.Damages: {
                let damage, miss, crit, target, precision, variance, fixRes, percentRes, element, critical, stat, abbreviation, max, before, currencyID, battler;
                for (let i = 0; i < l; i++) {
                    damage = 0;
                    miss = false;
                    crit = false;
                    target = targets[i].player;
                    // Calculate damages
                    if (this.isDamagePrecision) {
                        precision = Interpreter.evaluate(this
                            .damagePrecisionFormula.getValue(), { user: user,
                            target: target });
                        if (!Mathf.randomPercentTest(precision)) {
                            damage = null;
                            miss = true;
                        }
                    }
                    if (damage !== null) {
                        damage = Interpreter.evaluate(this.damageFormula
                            .getValue(), { user: user, target: target });
                        if (this.isDamageVariance) {
                            variance = Math.round(damage * Interpreter.evaluate(this.damageVarianceFormula.getValue(), { user: user, target: target }) / 100);
                            damage = Mathf.random(damage - variance, damage +
                                variance);
                        }
                        if (this.isDamageElement) {
                            element = this.damageElementID.getValue();
                            fixRes = target[Datas.BattleSystems.getStatistic(Datas.BattleSystems.statisticsElements[element])
                                .abbreviation];
                            percentRes = target[Datas.BattleSystems.getStatistic(Datas.BattleSystems.statisticsElementsPercent[element]).abbreviation];
                            damage -= (damage * percentRes / 100);
                            damage -= fixRes;
                        }
                        if (this.isDamageCritical) {
                            critical = Interpreter.evaluate(this
                                .damageCriticalFormula.getValue(), { user: user,
                                target: target });
                            if (Mathf.randomPercentTest(critical)) {
                                damage = Interpreter.evaluate(Interpreter
                                    .evaluate(Datas.BattleSystems.formulaCrit
                                    .getValue(), { user: user, target: target,
                                    damage: damage }));
                                crit = true;
                            }
                        }
                        if (this.isDamagesMinimum) {
                            damage = Math.max(damage, Interpreter.evaluate(this
                                .damagesMinimumFormula.getValue(), { user: user,
                                target: target }));
                        }
                        if (this.isDamagesMaximum) {
                            damage = Math.min(damage, Interpreter.evaluate(this
                                .damagesMaximumFormula.getValue(), { user: user,
                                target: target }));
                        }
                        damage = Math.round(damage);
                    }
                    if (this.isDamageStockVariableID) {
                        Game.current.variables[this.damageStockVariableID]
                            = damage === null ? 0 : damage;
                    }
                    // For diplaying result in HUD
                    if (Scene.Map.current.isBattleMap) {
                        battler = targets[i];
                        battler.damages = damage;
                        battler.isDamagesMiss = miss;
                        battler.isDamagesCritical = crit;
                    }
                    // Result accoring to damage kind
                    switch (this.damageKind) {
                        case DamagesKind.Stat:
                            stat = Datas.BattleSystems.getStatistic(this
                                .damageStatisticID.getValue());
                            abbreviation = stat.abbreviation;
                            max = target[stat.getMaxAbbreviation()];
                            before = target[abbreviation];
                            target[abbreviation] -= damage;
                            if (target[abbreviation] < 0) {
                                target[abbreviation] = 0;
                            }
                            if (!stat.isFix) {
                                target[abbreviation] = Math.min(target[abbreviation], max);
                            }
                            result = result || (before !== max && damage !== 0);
                            break;
                        case DamagesKind.Currency:
                            currencyID = this.damageCurrencyID.getValue();
                            if (target.kind === CharacterKind.Hero) {
                                before = Game.current.currencies[currencyID];
                                Game.current.currencies[currencyID] -=
                                    damage;
                                if (Game.current.currencies[currencyID] <
                                    0) {
                                    Game.current.currencies[currencyID] =
                                        0;
                                }
                                result = result || (before !== Game.current
                                    .currencies[currencyID] && damage !== 0);
                            }
                            break;
                        case DamagesKind.Variable:
                            before = Game.current.variables[this
                                .damageVariableID];
                            Game.current.variables[this.damageVariableID]
                                -= damage;
                            if (Game.current.variables[this
                                .damageVariableID] < 0) {
                                Game.current.variables[this
                                    .damageVariableID] = 0;
                            }
                            result = result || (before !== Game.current
                                .variables[this.damageVariableID] && damage !==
                                0);
                            break;
                    }
                }
                break;
            }
            case EffectKind.Status: {
                let precision, miss, target, id, previousFirst;
                for (let i = 0, l = targets.length; i < l; i++) {
                    target = targets[i];
                    precision = Interpreter.evaluate(this.statusPrecisionFormula
                        .getValue(), { user: user, target: target.player });
                    if (Mathf.randomPercentTest(precision)) {
                        miss = false;
                        id = this.statusID.getValue();
                        previousFirst = target.player.status[0];
                        // Add or remove status
                        if (this.isAddStatus) {
                            target.lastStatusHealed = null;
                            target.lastStatus = target.addStatus(id);
                        }
                        else {
                            target.lastStatusHealed = target.removeStatus(id);
                            target.lastStatus = null;
                        }
                        // If first status changed, change animation
                        target.updateAnimationStatus(previousFirst);
                    }
                    else {
                        miss = true;
                    }
                    // For diplaying result in HUD
                    if (Scene.Map.current.isBattleMap) {
                        target.damages = null;
                        target.isDamagesMiss = miss;
                        target.isDamagesCritical = false;
                    }
                }
                break;
            }
            case EffectKind.AddRemoveSkill:
                break;
            case EffectKind.PerformSkill:
                break;
            case EffectKind.CommonReaction:
                Scene.Map.current.reactionInterpreters.push(new ReactionInterpreter(null, Datas.CommonEvents
                    .getCommonReaction(this.commonReaction.commonReactionID), null, null, this.commonReaction.parameters));
                break;
            case EffectKind.SpecialActions:
                Scene.Map.current.battleCommandKind = this.specialActionKind;
                break;
            case EffectKind.Script:
                break;
        }
        return result;
    }
    /**
     *  Check if the effect is animated.
     *  @returns {boolean}
     */
    isAnimated() {
        return this.kind === EffectKind.Damages || this.kind === EffectKind
            .Status || this.kind === EffectKind.CommonReaction;
    }
    /**
     *  Get the string representation of the effect.
     *  @returns {string}
     */
    toString() {
        let user = Scene.Map.current.user ? Scene.Map.current.user
            .player : Player.getTemporaryPlayer();
        let target = Player.getTemporaryPlayer();
        switch (this.kind) {
            case EffectKind.Damages:
                let damage = Interpreter.evaluate(this.damageFormula.getValue(), { user: user, target: target });
                if (damage === 0) {
                    return "";
                }
                let precision = 100;
                let critical = 0;
                let variance = 0;
                if (this.isDamageVariance) {
                    variance = Math.round(damage * Interpreter.evaluate(this
                        .damageVarianceFormula.getValue(), { user: user, target: target }) / 100);
                }
                let min = damage - variance;
                let max = damage + variance;
                if (damage < 0) {
                    let temp = min;
                    min = -max;
                    max = -temp;
                }
                let options = [];
                if (this.isDamagePrecision) {
                    precision = Interpreter.evaluate(this.damagePrecisionFormula
                        .getValue(), { user: user, target: target });
                    options.push("precision: " + precision + "%");
                }
                if (this.isDamageCritical) {
                    critical = Interpreter.evaluate(this.damageCriticalFormula
                        .getValue(), { user: user, target: target });
                    options.push("critical: " + critical + "%");
                }
                let damageName = "";
                switch (this.damageKind) {
                    case DamagesKind.Stat:
                        damageName = Datas.BattleSystems.getStatistic(this
                            .damageStatisticID.getValue()).name;
                        break;
                    case DamagesKind.Currency:
                        damageName = Datas.Systems.getCurrency(this
                            .damageCurrencyID.getValue()).name();
                        break;
                    case DamagesKind.Variable:
                        damageName = Datas.Variables.get(this.damageVariableID);
                        break;
                }
                return (damage > 0 ? "Damage" : "Heal") + " " + damageName +
                    ": " + (min === max ? min : min + " - " + max) + (options
                    .length > 0 ? " [" + options.join(" - ") + "]" : "");
            case EffectKind.Status:
                return (this.isAddStatus ? "Add" : "Remove") + " " + Datas
                    .Status.get(this.statusID.getValue()).name() + " [precision: " +
                    Interpreter.evaluate(this.statusPrecisionFormula.getValue(), { user: user, target: target }) + "%]";
            case EffectKind.AddRemoveSkill:
                return (this.isAddSkill ? "Add" : "Remove") + " skill " + Datas
                    .Skills.get(this.addSkillID.getValue()).name;
            case EffectKind.PerformSkill:
                return "Perform skill " + Datas.Skills.get(this.performSkillID
                    .getValue()).name;
            default:
                return "";
        }
    }
}
export { Effect };
