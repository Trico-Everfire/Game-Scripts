/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/
import { Base } from "./Base.js";
import { Graphic, Datas, Scene, Manager } from "../index.js";
import { Constants, Enum, ScreenResolution } from "../Common/index.js";
var Align = Enum.Align;
var OrientationWindow = Enum.OrientationWindow;
var TargetKind = Enum.TargetKind;
var AvailableKind = Enum.AvailableKind;
import { WindowBox, WindowChoices, Game, Rectangle } from "../Core/index.js";
/** @class
 *  A scene in the menu for describing inventory.
 *  @extends Scene.Base
 */
class MenuInventory extends Base {
    constructor() {
        super(false);
        // Initializing the top menu for item kinds
        let l = Datas.Systems.inventoryFilters.length;
        let menuKind = new Array();
        let i;
        for (i = 0, l = Datas.Systems.inventoryFilters.length; i < l; i++) {
            menuKind[i] = new Graphic.Text(Datas.Systems.inventoryFilters[i]
                .name(), { align: Align.Center });
        }
        // All the windows
        this.windowTop = new WindowBox(20, 20, 200, 30, {
            content: new Graphic.Text("Inventory", { align: Align.Center })
        });
        this.windowChoicesTabs = new WindowChoices(5, 60, 100, WindowBox
            .SMALL_SLOT_HEIGHT, menuKind, {
            orientation: OrientationWindow.Horizontal,
            nbItemsMax: 6
        });
        this.createWindowChoicesList();
        this.createWindowBoxInformation();
        this.windowEmpty = new WindowBox(10, 100, ScreenResolution.SCREEN_X - 20, WindowBox.SMALL_SLOT_HEIGHT, {
            content: new Graphic.Text("Empty", { align: Align.Center }),
            padding: WindowBox.SMALL_SLOT_PADDING
        });
        this.createWindowBoxUseItem();
        l = menuKind.length;
        this.positionChoice = new Array(l);
        for (i = 0; i < l; i++) {
            this.positionChoice[i] = {
                index: 0,
                offset: 0
            };
        }
        // Update for changing tab
        this.substep = 0;
        this.updateForTab();
        this.synchronize();
    }
    /**
     *  Create the choice list.
     */
    createWindowChoicesList() {
        const rect = new Rectangle(Constants.HUGE_SPACE, Constants.HUGE_SPACE +
            ((WindowBox.SMALL_SLOT_HEIGHT + Constants.LARGE_SPACE) * 2), WindowBox
            .LARGE_SLOT_WIDTH, WindowBox.SMALL_SLOT_HEIGHT);
        const options = {
            nbItemsMax: Scene.Menu.SLOTS_TO_DISPLAY
        };
        this.windowChoicesList = new WindowChoices(rect.x, rect.y, rect.width, rect.height, [], options);
    }
    /**
     *  Create the information window.
     */
    createWindowBoxInformation() {
        const width = ScreenResolution.SCREEN_X - (Constants.HUGE_SPACE * 2) -
            WindowBox.LARGE_SLOT_WIDTH - Constants.LARGE_SPACE;
        const height = 215;
        const rect = new Rectangle(ScreenResolution.SCREEN_X - Constants
            .HUGE_SPACE - width, Constants.HUGE_SPACE + ((WindowBox
            .SMALL_SLOT_HEIGHT + Constants.LARGE_SPACE) * 2), width, height);
        const options = {
            padding: WindowBox.HUGE_PADDING_BOX
        };
        this.windowBoxInformation = new WindowBox(rect.x, rect.y, rect.width, rect
            .height, options);
    }
    /**
     *  Create the user item window.
     */
    createWindowBoxUseItem() {
        const width = this.windowBoxInformation.oW;
        const height = 140;
        const rect = new Rectangle(ScreenResolution.SCREEN_X - Constants
            .HUGE_SPACE - width, this.windowBoxInformation.oY + this
            .windowBoxInformation.oH + Constants.MEDIUM_SPACE, width, height);
        const graphic = new Graphic.UseSkillItem();
        const options = {
            content: graphic,
            padding: WindowBox.SMALL_PADDING_BOX
        };
        this.windowBoxUseItem = new WindowBox(rect.x, rect.y, rect.width, rect
            .height, options);
    }
    /**
     *  Update informations to display.
     */
    synchronize() {
        this.windowBoxInformation.content = this.windowChoicesList
            .getCurrentContent();
    }
    /**
     *  Update tab.
     */
    updateForTab() {
        let indexTab = this.windowChoicesTabs.currentSelectedIndex;
        let nbItems = Game.current.items.length;
        let list = [];
        let ownedItem;
        for (let i = 0; i < nbItems; i++) {
            ownedItem = Game.current.items[i];
            if (Datas.Systems.inventoryFilters[indexTab].getFilter()(ownedItem)) {
                list.push(new Graphic.Item(ownedItem));
            }
        }
        this.windowChoicesList.setContentsCallbacks(list);
        this.windowChoicesList.unselect();
        this.windowChoicesList.offsetSelectedIndex = this.positionChoice[indexTab].offset;
        this.windowChoicesList.select(this.positionChoice[indexTab].index);
    }
    /**
     *  Use the current item.
     */
    useItem() {
        let graphic = this.windowBoxInformation.content;
        Game.current.useItem(graphic.item);
        if (graphic.item.nb > 0) {
            graphic.updateNb();
        }
        else {
            this.updateForTab();
            this.substep = 0;
            Manager.Stack.requestPaintHUD = true;
        }
        this.windowBoxUseItem.content.updateStats();
        Manager.Stack.requestPaintHUD = true;
    }
    /**
     *  Move tab according to key.
     *  @param {number} key - The key ID
     */
    moveTabKey(key) {
        // Tab
        let indexTab = this.windowChoicesTabs.currentSelectedIndex;
        this.windowChoicesTabs.onKeyPressedAndRepeat(key);
        if (indexTab !== this.windowChoicesTabs.currentSelectedIndex) {
            this.updateForTab();
        }
        // List
        this.windowChoicesList.onKeyPressedAndRepeat(key);
        let position = this.positionChoice[this.windowChoicesTabs
            .currentSelectedIndex];
        position.index = this.windowChoicesList.currentSelectedIndex;
        position.offset = this.windowChoicesList.offsetSelectedIndex;
        this.synchronize();
    }
    /**
     *  Update the scene.
     */
    update() {
        Scene.Base.prototype.update.call(Scene.Map.current);
        if (this.windowChoicesList.currentSelectedIndex !== -1) {
            this.windowBoxUseItem.update();
        }
    }
    /**
     *  Handle scene key pressed.
     *  @param {number} key - The key ID
     */
    onKeyPressed(key) {
        Scene.Base.prototype.onKeyPressed.call(Scene.Map.current, key);
        let graphic = this.windowBoxInformation.content;
        switch (this.substep) {
            case 0:
                if (Datas.Keyboards.isKeyEqual(key, Datas.Keyboards.menuControls
                    .Action)) {
                    if (this.windowBoxInformation.content === null) {
                        return;
                    }
                    let targetKind = graphic.item.system.targetKind;
                    let availableKind = graphic.item.system.availableKind;
                    if (graphic.item.system.consumable && (targetKind ===
                        TargetKind.Ally || targetKind === TargetKind.AllAllies) &&
                        (availableKind === AvailableKind.Always || availableKind
                            === AvailableKind.MainMenu)) {
                        Datas.Systems.soundConfirmation.playSound();
                        this.substep = 1;
                        this.windowBoxUseItem.content
                            .setAll(targetKind === TargetKind.AllAllies);
                        Manager.Stack.requestPaintHUD = true;
                    }
                    else {
                        Datas.Systems.soundImpossible.playSound();
                    }
                }
                else if (Datas.Keyboards.isKeyEqual(key, Datas.Keyboards
                    .menuControls.Cancel) || Datas.Keyboards.isKeyEqual(key, Datas.Keyboards.controls.MainMenu)) {
                    Datas.Systems.soundCancel.playSound();
                    Manager.Stack.pop();
                }
                break;
            case 1:
                if (Datas.Keyboards.isKeyEqual(key, Datas.Keyboards.menuControls
                    .Action)) {
                    if (graphic.item.system.isPossible() && graphic.item.system.use()) {
                        this.useItem();
                    }
                }
                else if (Datas.Keyboards.isKeyEqual(key, Datas.Keyboards
                    .menuControls.Cancel) || Datas.Keyboards.isKeyEqual(key, Datas.Keyboards.controls.MainMenu)) {
                    Datas.Systems.soundCancel.playSound();
                    this.substep = 0;
                    Manager.Stack.requestPaintHUD = true;
                }
                break;
        }
    }
    /**
     *  Handle scene key released.
     *  @param {number} key - The key ID
     */
    onKeyReleased(key) {
        Scene.Base.prototype.onKeyReleased.call(Scene.Map.current, key);
    }
    /**
     *  Handle scene pressed repeat key.
     *  @param {number} key - The key ID
     *  @returns {boolean}
     */
    onKeyPressedRepeat(key) {
        return Scene.Base.prototype.onKeyPressedRepeat.call(Scene.Map.current, key);
    }
    /**
     *  Handle scene pressed and repeat key.
     *  @param {number} key - The key ID
     *  @returns {boolean}
     */
    onKeyPressedAndRepeat(key) {
        let res = Scene.Base.prototype.onKeyPressedAndRepeat.call(Scene.Map
            .current, key);
        switch (this.substep) {
            case 0:
                this.moveTabKey(key);
                break;
            case 1:
                this.windowBoxUseItem.content
                    .onKeyPressedAndRepeat(key);
                break;
        }
        return res;
    }
    /**
     *  Draw the HUD scene.
     */
    drawHUD() {
        // Draw the local map behind
        Scene.Map.current.drawHUD();
        // Draw the menu
        this.windowTop.draw();
        this.windowChoicesTabs.draw();
        this.windowChoicesList.draw();
        if (this.windowChoicesList.listWindows.length > 0) {
            this.windowBoxInformation.draw();
            if (this.substep === 1) {
                this.windowBoxUseItem.draw();
            }
        }
        else {
            this.windowEmpty.draw();
        }
    }
}
export { MenuInventory };
