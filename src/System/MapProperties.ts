/*
    RPG Paper Maker Copyright (C) 2017-2021 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { Base } from "./Base";
import { THREE } from "../Globals";
import { Datas, System, Manager, Scene } from "../index";
import { PlaySong } from "./PlaySong";
import { DynamicValue } from "./DynamicValue";
import { MapObject } from "../Core/MapObject";
import { Enum, Constants, Utils, Mathf } from "../Common";
import SongKind = Enum.SongKind;
import PictureKind = Enum.PictureKind;
import { CameraProperties } from "./CameraProperties";
import { Color } from "./Color";
import { Game } from "../Core";

/** @class
 *  The properties of a map.
 *  @extends System.Base
 */
class MapProperties extends Base {

    public id: number;
    public name: string;
    public length: number;
    public width: number;
    public height: number;
    public depth: number;
    public tileset: System.Tileset;
    public music: PlaySong;
    public backgroundSound:PlaySong;
    public cameraProperties: CameraProperties;
    public isBackgroundColor: boolean;
    public isBackgroundImage: boolean;
    public backgroundColorID: DynamicValue;
    public backgroundColor: Color;
    public backgroundImageID: number;
    public backgroundSkyboxID: DynamicValue;
    public startupObject: MapObject;
    public randomBattleMapID: System.DynamicValue;
    public randomBattles: System.RandomBattle[];
    public randomBattleNumberStep: System.DynamicValue;
    public randomBattleVariance: System.DynamicValue;
    public cameraBackground: THREE.Camera;
    public sceneBackground: THREE.Scene;
    public skyboxGeometry: THREE.BoxGeometry;
    public currentNumberSteps: number;
    public maxNumberSteps: number;

    constructor() {
        super();

        this.sceneBackground = null;
        this.skyboxGeometry = null;
        this.currentNumberSteps = 0;
    }

    /** 
     *  Read the JSON associated to the map properties.
     *  @param {Record<string, any>} - json Json object describing the map 
     *  properties
     */
    read(json: Record<string, any>) {
        this.id = json.id;
        this.name = json.name;
        this.length = json.l;
        this.width = json.w;
        this.height = json.h;
        this.depth = json.d;

        // Tileset: if not existing, by default select the first one
        this.tileset = Datas.Tilesets.get(json.tileset);
        this.music = new PlaySong(SongKind.Music, json.music);
        this.backgroundSound = new PlaySong(SongKind.BackgroundSound, json.bgs);
        this.cameraProperties = Datas.Systems.getCameraProperties(DynamicValue
            .readOrDefaultDatabase(json.cp, 1).getValue());
        this.isBackgroundColor = json.isky;
        this.isBackgroundImage = json.isi;
        if (this.isBackgroundColor) {
            this.backgroundColorID = new DynamicValue(json.sky);
        } else if (this.isBackgroundImage) {
            this.backgroundImageID = json.ipid;
            this.updateBackgroundImage();
        } else   {
            this.backgroundSkyboxID = DynamicValue.readOrDefaultDatabase(json
                .sbid);
            this.updateBackgroundSkybox();
        }
        this.updateBackgroundColor();
        var startupReactions = new System.MapObject(json.so);
        this.startupObject = new MapObject(startupReactions);
        this.startupObject.changeState();

        // Random battles
        this.randomBattleMapID = System.DynamicValue.readOrDefaultDatabase(json
            .randomBattleMapID);
        this.randomBattles = [];
        Utils.readJSONSystemList({ list: Utils.defaultValue(json.randomBattles, 
            []), listIndexes: this.randomBattles, cons: System.RandomBattle });
        this.randomBattleNumberStep = System.DynamicValue.readOrDefaultNumber(
            json.randomBattleNumberStep, 300);
        this.randomBattleVariance = System.DynamicValue.readOrDefaultNumber(
            json.randomBattleVariance, 20);
        this.updateMaxNumberSteps();
    }

    /** 
     *  Update the background color
     */
    updateBackgroundColor() {
        this.backgroundColor = Datas.Systems.getColor(this.isBackgroundColor ? 
            this.backgroundColorID.getValue() : 1);
    }

    /** 
     *  Update the background image
     */
    updateBackgroundImage() {
        let bgMat = Manager.GL.createMaterial(Manager.GL.textureLoader.load(
            Datas.Pictures.get(PictureKind.Pictures, this.backgroundImageID)
            .getPath()), { flipY: true });
        bgMat.depthTest = false;
        bgMat.depthWrite = false;
        this.sceneBackground = new THREE.Scene();
        this.cameraBackground = new THREE.Camera();
        this.sceneBackground.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 
            2), bgMat));
    }

    /** 
     *  Update the background skybox.
     */
    updateBackgroundSkybox() {
        let size = 10000 * Datas.Systems.SQUARE_SIZE / Constants
            .BASIC_SQUARE_SIZE;
        this.skyboxGeometry = new THREE.BoxGeometry(size, size, size);
        Scene.Map.current.scene.add(new THREE.Mesh(this.skyboxGeometry, Datas
            .Systems.getSkybox(this.backgroundSkyboxID.getValue()).createTextures()));
    }

    /** 
     *  Update the max steps numbers for starting a random battle.
     */
    updateMaxNumberSteps() {
        this.currentNumberSteps = 0;
        this.maxNumberSteps = Mathf.variance(this.randomBattleNumberStep
            .getValue(), this.randomBattleVariance.getValue());
    }

    /** 
     *  Check if a random battle can be started.
     */
    checkRandomBattle() {
        this.currentNumberSteps++;
        if (this.currentNumberSteps >= this.maxNumberSteps) {
            this.updateMaxNumberSteps();
            let randomBattle = null;
            let rand = Mathf.random(0, 100);
            let priority = 0;
            // Remove 0 priority
            let battles = [];
            let total = 0;
            for (randomBattle of this.randomBattles) {
                randomBattle.updateCurrentPriority();
                if (randomBattle.currentPriority > 0) {
                    battles.push(randomBattle);
                    total += randomBattle.currentPriority;
                }
            }
            for (randomBattle of this.randomBattles) {
                priority += randomBattle.priority.getValue() / total * 100;
                if (rand <= priority) {
                    break;
                } else {
                    randomBattle = null;
                }
            }
            if (randomBattle !== null) {
                let battleMap = Datas.BattleSystems.getBattleMap(this
                    .randomBattleMapID.getValue());
                Game.current.heroBattle = new MapObject(Game.current.hero.system,
                    battleMap.position.toVector3(), true);
                Manager.Stack.push(new Scene.Battle(randomBattle.troopID
                    .getValue(), true, true, battleMap, Enum.MapTransitionKind
                    .Zoom, Enum.MapTransitionKind.Zoom, null, null));
            }
        }
    }
}

export { MapProperties }