
/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { Datas, Graphic, Scene, System } from "..";
import { Enum, Mathf } from "../Common";
import { Animation, Battler } from "../Core";
import { Status } from "../Core/Status";

// -------------------------------------------------------
//
//  CLASS BattleStartTurn
//
//      SubStep 0 : Random attacks
//      SubStep 1 : Status effect
//
// -------------------------------------------------------

class BattleStartTurn {

    public battle: Scene.Battle
    public step: number = 0;
    public active: boolean = false;
    public statusHealed: [Battler, Status[]][] = [];
    public statusStill: [Battler, Status[]][] = [];

    constructor(battle: Scene.Battle) {
        this.battle = battle;
    }

    /** 
     *  Initialize step.
     */
    public initialize() {
        this.active = true;
        this.battle.time = new Date().getTime() - Scene.Battle.TIME_ACTION_ANIMATION;

        // Check status releases
        let i: number, l: number, battler: Battler, s: Status;
        if (this.step === 0) {
            let listStill: Status[], listHealed: Status[];
            for (i = 0, l = this.battle.battlers[this.battle.attackingGroup]
                .length; i < l; i++) {
                battler = this.battle.battlers[this.battle.attackingGroup][i];
                if (!battler.player.isDead()) {
                    s = battler.player.status[0];
                    listStill = [];
                    listHealed = battler.player.removeStartTurnStatus(listStill);
                    battler.updateStatusStep();
                    battler.updateAnimationStatus(s);
                    if (listHealed.length > 0) {
                        this.statusHealed.push([battler, listHealed]);
                    }
                    if (listStill.length > 0) {
                        this.statusStill.push([battler, listStill]);
                    }
                }
            }
            if (this.statusHealed.length > 0 || this.statusStill.length > 0) {
                this.step++;
                return;
            }
            this.step = 3;
        }

        // Status effects
        if (this.step === 3) {
            this.step++;
        }

        // Check status restrictions (force attacks)
        if (this.step === 4) {
            for (i = 0, l = this.battle.battlers[this.battle.attackingGroup]
                .length; i < l; i++) {
                battler = this.battle.battlers[this.battle.attackingGroup][i];
                if (battler.active) {
                    if (battler.containsRestriction(Enum.StatusRestrictionsKind
                        .CantDoAnything)) {
                        continue;
                    }
                    if (battler.containsRestriction(Enum.StatusRestrictionsKind
                        .AttackRandomAlly)) {
                        this.defineRandom(battler, Enum.StatusRestrictionsKind
                            .AttackRandomAlly);
                        return;
                    }
                    if (battler.containsRestriction(Enum.StatusRestrictionsKind
                        .AttackRandomEnemy)) {
                        this.defineRandom(battler, Enum.StatusRestrictionsKind
                            .AttackRandomEnemy);
                        return;
                    }
                    if (battler.containsRestriction(Enum.StatusRestrictionsKind
                        .AttackRandomTarget)) {
                        this.defineRandom(battler, Enum.StatusRestrictionsKind
                            .AttackRandomTarget);
                        return;
                    }
                }
            }
            if (this.battle.isEndTurn()) {
                this.battle.activeGroup();
                this.battle.switchAttackingGroup();
                this.battle.changeStep(Enum.BattleStep.StartTurn);
            } else {
                this.startSelectionEnemyAttack();
            }
        }
    }

    public startSelectionEnemyAttack() {
        this.active = false;
        this.step = 0;
        if (this.battle.attackingGroup === Enum.CharacterKind.Hero) {
            this.battle.changeStep(Enum.BattleStep.Selection); // Attack of heroes
        } else {
            this.battle.changeStep(Enum.BattleStep.EnemyAttack); // Attack of ennemies
        }
    }

    public defineRandom(user: Battler, restriction: Enum.StatusRestrictionsKind) {
        this.battle.user = user;
        if (this.battle.attackingGroup === Enum.CharacterKind.Hero) {
            this.battle.battleCommandKind = Enum.EffectSpecialActionKind.OpenSkills;
            this.battle.currentEffectIndex = 0;
            let skills: System.Skill[] = [];
            let skill: System.Skill;
            for (let i = 0, l = user.player.sk.length; i < l; i++) {
                skill = Datas.Skills.get(user.player.sk[i].id);
                if (!skill.isPossible()) {
                    continue;
                }
                if (restriction === Enum.StatusRestrictionsKind.AttackRandomAlly &&
                    skill.targetKind !== Enum.TargetKind.AllEnemies && skill
                    .targetKind !== Enum.TargetKind.Enemy) {
                    continue;
                }
                if (restriction === Enum.StatusRestrictionsKind.AttackRandomEnemy &&
                    skill.targetKind !== Enum.TargetKind.AllEnemies && skill
                    .targetKind !== Enum.TargetKind.Enemy) {
                    continue;
                }
                if (restriction === Enum.StatusRestrictionsKind.AttackRandomTarget &&
                    skill.targetKind !== Enum.TargetKind.AllEnemies && skill
                    .targetKind !== Enum.TargetKind.Enemy) {
                    continue;
                }
                skills.push(skill);
            }
            if (skills.length === 0) {
                this.battle.battleCommandKind = Enum.EffectSpecialActionKind.DoNothing;
                return;
            }
            skill = skills[Mathf.random(0, skills.length - 1)];
            this.battle.currentSkill = skill;
            this.battle.animationUser = new Animation(skill.animationUserID.getValue());
            this.battle.animationTarget = new Animation(skill.animationTargetID.getValue());
            let side: Enum.CharacterKind;
            switch (restriction) {
                case Enum.StatusRestrictionsKind.AttackRandomAlly:
                    side = Enum.CharacterKind.Hero;
                    break;
                case Enum.StatusRestrictionsKind.AttackRandomEnemy:
                    side = Enum.CharacterKind.Monster;
                    break;
                case Enum.StatusRestrictionsKind.AttackRandomTarget:
                    side = Mathf.random(0, 1) === 0 ? Enum.CharacterKind
                        .Hero : Enum.CharacterKind.Monster;
                    break;
            }
            switch (skill.targetKind) {
                case Enum.TargetKind.AllEnemies: {
                    this.battle.targets = this.battle.battlers[side]
                    break;
                }
                case Enum.TargetKind.Enemy: {
                    this.battle.targets = [this.battle.battlers[side][Mathf
                        .random(0, this.battle.battlers[side].length - 1)]];
                    break;
                }
            }
        } else {
            this.battle.battleEnemyAttack.defineAction(restriction);
            this.battle.battleEnemyAttack.defineTargets(restriction);
        }
        this.battle.changeStep(Enum.BattleStep.Animation);
    }

    /** 
     *  Update the battle.
     */
    public update() {
        if ((new Date().getTime() - this.battle.time) >= Scene.Battle.TIME_ACTION_ANIMATION) {
            // Healed status
            if (this.step === 1) {
                if (this.statusHealed.length > 0) {
                    let tab = this.statusHealed[0];
                    let battler = tab[0];
                    let status = tab[1];
                    let s = status[0];
                    (<Graphic.Text>this.battle.windowTopInformations.content)
                        .setText(s.getMessageHealed(battler));
                    this.battle.time = new Date().getTime() - (Scene.Battle
                        .TIME_ACTION_ANIMATION / 2);
                    status.splice(0, 1);
                    if (status.length === 0) {
                        this.statusHealed.splice(0, 1);
                    }
                    return;
                }
                this.step++;
            }
            // Still status + effects
            if (this.step === 2) {
                if (this.statusStill.length > 0) {
                    let tab = this.statusStill[0];
                    let battler = tab[0];
                    let status = tab[1];
                    let s = status[0];
                    (<Graphic.Text>this.battle.windowTopInformations.content)
                        .setText(s.getMessageStillAffected(battler));
                    status.splice(0, 1);
                    if (status.length === 0) {
                        this.statusStill.splice(0, 1);
                    }
                    this.battle.time = new Date().getTime() - (Scene.Battle
                        .TIME_ACTION_ANIMATION / 2);
                    // If effects, apply animation only for those
                    if (s.system.effects.length > 0) {
                        this.battle.effects = s.system.effects;
                        this.battle.user = null;
                        this.battle.targets = [battler];
                        this.battle.currentEffectIndex = -1;
                        this.battle.currentTargetIndex = null;
                        this.battle.animationUser = null;
                        this.battle.animationTarget = null;
                        this.battle.step = Enum.BattleStep.Animation;
                        this.battle.subStep = 2;
                    }
                    return;
                }
                this.step++;
                this.initialize();
            }
        }
    }

    /** 
     *  Handle key pressed.
     *  @param {number} key - The key ID 
     */
    public onKeyPressedStep(key: number) {
        
    }

    /** 
     *  Handle key released.
     *  @param {number} key - The key ID 
     */
    public onKeyReleasedStep(key: number) {

    }

    /** 
     *  Handle key repeat pressed.
     *  @param {number} key - The key ID 
     *  @returns {boolean}
     */
    public onKeyPressedRepeatStep(key: number): boolean {
        return true;
    }

    /** 
     *  Handle key pressed and repeat.
     *  @param {number} key - The key ID
     *  @returns {boolean}
     */
    public onKeyPressedAndRepeatStep(key: number): boolean {
       return true;
    }

    /** 
     *  Draw the battle HUD.
     */
    public drawHUDStep() {
        this.battle.windowTopInformations.draw();
    }

}
export { BattleStartTurn }