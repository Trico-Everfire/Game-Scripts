/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { Class } from "./Class.js";
import { Utils } from "../Common/index.js";
import { Datas, System } from "../index.js";
import { Translatable } from "./Translatable.js";
/** @class
 *  An hero of the game.
 *  @extends System.Base
 *  @param {Record<string, any>} - [json=undefined] Json object describing the
 *  hero
 */
class Hero extends Translatable {
    constructor(json) {
        super(json);
    }
    /**
     *  Read the JSON associated to the hero.
     *  @param {Record<string, any>} - json Json object describing the hero
     */
    read(json) {
        super.read(json);
        this.class = Datas.Classes.get(json.class, "Could not find the class in "
            + (this.isMonster() ? "monster" : "hero") + " " + Utils.getIDName(json.id, this.name()) + ", please check your Data manager and add a correct class.");
        this.idBattler = Utils.defaultValue(json.bid, -1);
        this.idFaceset = Utils.defaultValue(json.fid, -1);
        this.classInherit = new Class(json.ci);
    }
    /**
     *  Check if this hero is a monster.
     *  @returns {boolean}
     */
    isMonster() {
        return this instanceof System.Monster;
    }
    /**
     *  Get the property according to class inherit and this hero.
     *  @param {string} prop - The property name
     *  @returns {number}
     */
    getProperty(prop) {
        return this.class.getProperty(prop, this.classInherit);
    }
    /**
     *  Get the experience table according to class inherit and this hero.
     *  @returns {Record<string, any>}
     */
    getExperienceTable() {
        return this.class.getExperienceTable(this.classInherit);
    }
    /**
     *  Get the characteristics according to class inherit and this hero.
     *  @returns {System.Characteristic[]}
     */
    getCharacteristics() {
        return this.class.getCharacteristics(this.classInherit);
    }
    /**
     *  Get the statistics progression according to class inherit and this hero.
     *  @returns {System.StatisticProgression[]}
     */
    getStatisticsProgression() {
        return this.class.getStatisticsProgression(this.classInherit);
    }
    /**
     *  Get the skills according to class inherit and this hero.
     *  @param {number} level
     *  @returns {Skill[]}
     */
    getSkills(level) {
        return this.class.getSkills(this.classInherit, level);
    }
    /**
     *  Get the learned skill at a specific level according to class inherit and
     *  this hero.
     *  @param {number} level
     *  @returns {Skill[]}
     */
    getLearnedSkills(level) {
        return this.class.getLearnedSkills(this.classInherit, level);
    }
    /**
     *  Create the experience list according to base and inflation.
     *  @returns {number[]}
     */
    createExpList() {
        let finalLevel = this.getProperty(Class.PROPERTY_FINAL_LEVEL);
        let experienceBase = this.getProperty(Class
            .PROPERTY_EXPERIENCE_BASE);
        let experienceInflation = this.getProperty(Class
            .PROPERTY_EXPERIENCE_INFLATION);
        let experienceTable = this.getExperienceTable();
        let expList = new Array(finalLevel + 1);
        // Basis
        let pow = 2.4 + experienceInflation / 100;
        expList[1] = 0;
        for (let i = 2; i <= finalLevel; i++) {
            expList[i] = expList[i - 1] + (experienceTable[i - 1] ?
                experienceTable[i - 1] : (Math.floor(experienceBase * (Math.pow(i + 3, pow) / Math.pow(5, pow)))));
        }
        return expList;
    }
}
export { Hero };
