/*
    RPG Paper Maker Copyright (C) 2017-2019 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

// -------------------------------------------------------
//
//  CLASS MapObject
//
// -------------------------------------------------------

/** @class
*   Element movable in local map.
*   @property {SystemObject} system System infos.
*   @property {number} speed Speed coef.
*   @property {Orientation} orientationEye Where the character is looking.
*   @property {THREE.Mesh} mesh The current mesh used for this object.
*   @param {THREE.Mesh} mesh The current mesh used for this object.
*   @param {SystemObject} system System infos.
*/
function MapObject(system, position) {
    this.system = system;
    this.position = position;
    this.mesh = null;
    this.meshBoundingBox = null;
    this.currentBoundingBox = null;
    this.boundingBoxSettings = null;
    this.speed = 1.0;
    this.frame = 0;
    this.orientationEye = Orientation.South;
    this.orientation = this.orientationEye;
    this.width = 1;
    this.height = 1;
    this.frameDuration = 150;
    this.moving = false;
    this.movingHorizontal = null;
    this.movingVertical = null;
    this.frameTick = 0;
    this.isHero = false;
    this.isInScene = false;
}

/** Normal speed coef.
*   @constant
*   @static
*   @default 0.004666
*/
MapObject.SPEED_NORMAL = 0.004666;

/** Update the object with a particular ID.
*   @static
*   @param {MapObject} object This object.
*   @param {number} objectID The object ID searched.
*   @param {Object} base The base module for the callback.
*   @param {function} callback The function to call after having found the
*   object.
*/
MapObject.updateObjectWithID = function(object, objectID, base, callback){
    switch (objectID){

    case -1: // This object
        callback.call(base, object);
        break;

    case 0: // Hero
        callback.call(base, $game.hero);
        break;

    default: // Particular object
        var globalPortion = SceneMap.getGlobalPortion(
                    $currentMap.allObjects[objectID]);
        var localPortion = $currentMap.getLocalPortion(globalPortion);
        var i, l, moved, mapsDatas, movedObjects, mapPortion, objects;

        // First search in the moved objects
        mapsDatas = $game.mapsDatas[$currentMap.id]
                         [globalPortion[0]][globalPortion[1]][globalPortion[2]];
        movedObjects = mapsDatas.m;
        moved = null;
        for (i = 0, l = movedObjects.length; i < l; i++){
            if (movedObjects[i].system.id === objectID){
                moved = movedObjects[i];
                break;
            }
        }
        if (moved !== null){
            callback.call(base, moved);
            break;
        }

        // If not moving, search directly in portion
        if ($currentMap.isInPortion(localPortion)) {
            mapPortion = $currentMap.getMapPortionByPortion(localPortion);
            objects = mapPortion.objectsList;

            for (i = 0, l = objects.length; i < l; i++){
                if (objects[i].system.id === objectID){
                    moved = objects[i];
                    break;
                }
            }

            if (moved === null) {
                callback.call(base, $game.hero);
            } else {
                callback.call(base, moved);
            }
        }
        // Load the file if not already in temp
        else{
            var fileName = SceneMap.getPortionName(realX, realY, realZ);
            RPM.openFile(this, RPM.FILE_MAPS + this.mapName + "/" +
                           fileName, false, function(res)
            {
                var json = JSON.parse(res);
                mapPortion = new MapPortion(globalPortion[0],
                                            globalPortion[1],
                                            globalPortion[2]);
                moved = mapPortion.getObjFromID(json.objs.sprites, objectID);

               if (moved === null) {
                   callback.call(base, $game.hero);
               } else {
                   callback.call(base, moved);
               }
            });
        }
        break;
    }
}

MapObject.prototype = {

    /** Update the current state (graphics to display). Also update the mesh.
    */
    changeState: function(){
        var angle = this.mesh ? this.mesh.rotation.y : 0;
        var x, y, picture;

        // Remove previous mesh
        this.removeFromScene();

        // Updating the current state
        var states;
        if (this.isHero)
            states = $game.heroStates;
        else {
            var portion = SceneMap.getGlobalPortion(
                        $currentMap.allObjects[this.system.id]);
            var portionDatas = $game.mapsDatas[$currentMap.id]
                    [portion[0]][portion[1]][portion[2]];
            var indexState = portionDatas.si.indexOf(this.system.id);
            states = (indexState === -1) ? [1] : portionDatas.s[indexState];
        }
        this.currentState = null;
        for (var i = this.system.states.length - 1; i >= 0; i--){
            var state = this.system.states[i];
            if (states.indexOf(state.id) !== -1){
                this.currentState = state;
                break;
            }
        }

        // Update mesh
        var material = this.currentState.graphicID === 0 ? $currentMap
            .textureTileset : $currentMap.texturesCharacters[this.currentState
            .graphicID];
        this.meshBoundingBox = new Array;
        if (this.currentState !== null && !this.isNone() && material && material
            .map)
        {
            this.frame = this.currentState.indexX;
            this.orientationEye = this.currentState.indexY;
            this.updateOrientation();

            if (this.currentState.graphicID === 0) {
                x = this.currentState.rectTileset[0];
                y = this.currentState.rectTileset[1];
                this.width = this.currentState.rectTileset[2];
                this.height = this.currentState.rectTileset[3];
            } else {
                x = 0;
                y = 0;
                this.width = Math.floor(material.map.image.width / $SQUARE_SIZE /
                    $FRAMES);
                this.height = Math.floor(material.map.image.height /
                    $SQUARE_SIZE / 4);
            }

            var sprite = new Sprite(this.currentState.graphicKind,
                                    [x, y, this.width, this.height]);
            var geometry, objCollision, result;
            result = sprite.createGeometry(this.width, this.height, false,
                                           this.position);
            geometry = result[0];
            objCollision = result[1];
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(this.position.x,
                                   this.position.y,
                                   this.position.z);
            this.boundingBoxSettings = objCollision[1][0];
            if (this.currentState.graphicID === 0) {
                picture = $currentMap.mapInfos.tileset.picture;
                this.boundingBoxSettings.squares = picture ? picture
                    .getSquaresForTexture(this.currentState.rectTileset) : [];
            }

            this.updateBB(this.position);
            this.updateUVs();
            this.updateAngle(angle);
        }
        else {
            this.mesh = null;
            this.boundingBoxSettings = null;
        }

        // Add to the scene
        this.addToScene();
    },

    /** Read the JSON associated to the object.
    *   @param {Object} json Json object describing the object.
    */
    read: function(json){
        var jsonPosition = json.k;
        this.position = RPM.positionToVector3(jsonPosition);
        this.system = new SystemObject;
        this.system.readJSON(json.v);
    },

    /** Simulate moving object position.
    *   @param {Orientation} orientation Where to move.
    *   @param {number} distance The distance.
    *   @returns {THREE.Vector3}
    */
    getFuturPosition: function(orientation, distance, angle){

        var position = new THREE.Vector3(this.position.x,
                                         this.position.y,
                                         this.position.z);

        // The speed depends on the time elapsed since the last update
        var xPlus, zPlus, xAbs, zAbs, res, i, l, blocked;
        var w = $currentMap.mapInfos.length * $SQUARE_SIZE;
        var h = $currentMap.mapInfos.width * $SQUARE_SIZE;
        var result, yMountain;

        switch (orientation){
        case Orientation.South:
            xPlus = distance * RPM.cos(angle * Math.PI / 180.0);
            zPlus = distance * RPM.sin(angle * Math.PI / 180.0);
            res = position.z - zPlus;
            if (res >= 0 && res < h)
                position.setZ(res);
            res = position.x - xPlus;
            if (res >= 0 && res < w)
                position.setX(res);
            break;
        case Orientation.West:
            xPlus = distance * RPM.cos((angle - 90.0) * Math.PI / 180.0);
            zPlus = distance * RPM.sin((angle - 90.0) * Math.PI / 180.0);
            res = position.x + xPlus;
            if (res >= 0 && res < w)
                position.setX(res);
            res = position.z + zPlus;
            if (res >= 0 && res < h)
               position.setZ(res);
            break;
        case Orientation.North:
            xPlus = distance * RPM.cos(angle * Math.PI / 180.0);
            zPlus = distance * RPM.sin(angle * Math.PI / 180.0);
            res = position.z + zPlus;
            if (res >= 0 && res < h)
                position.setZ(res);
            res = position.x + xPlus;
            if (res >= 0 && res < w)
                position.setX(res);
            break;
        case Orientation.East:
            xPlus = distance * RPM.cos((angle - 90.0) * Math.PI / 180.0);
            zPlus = distance * RPM.sin((angle - 90.0) * Math.PI / 180.0);
            res = position.x - xPlus;
            if (res >= 0 && res < w)
                position.setX(res);
            res = position.z - zPlus;
            if (res >= 0 && res < h)
                position.setZ(res);
            break;
        default:
            break;
        }

        // Collision
        this.updateBBPosition(position);
        yMountain = null;
        blocked = false;
        for (i = 0, l = this.meshBoundingBox.length; i < l; i++) {
            this.currentBoundingBox = this.meshBoundingBox[i];
            result = MapPortion.checkCollisionRay(this.position, position, this);
            if (result[0]) {
                blocked = true;
                position = this.position;
                break;
            }
            if (result[1] !== null) {
                yMountain = result[1];
            }
        }
        // If not blocked and possible Y up/down, check if there is no collision
        // on top
        if (!blocked && yMountain !== null) {
            position.setY(yMountain);
            for (i = 0, l = this.meshBoundingBox.length; i < l; i++) {
                this.currentBoundingBox = this.meshBoundingBox[i];
                result = MapPortion.checkCollisionRay(this.position, position,
                    this);
                if (result[0]) {
                    position = this.position;
                    break;
                }
            }
        }

        this.updateBBPosition(this.position);

        return position;
    },

    // -------------------------------------------------------

    checkCollisionObject: function(object, position) {
        for (var i = 0, l = this.meshBoundingBox.length; i < l; i++) {
            for (var j = 0, ll = object.meshBoundingBox.length; j < ll; j++) {
                if (CollisionsUtilities.obbVSobb(
                            this.meshBoundingBox[i].geometry,
                            object.meshBoundingBox[j].geometry))
                {
                    return true;
                }
            }
        }

        return false;
    },

    // -------------------------------------------------------

    isInRect: function(object) {
        var la, lb, ra, rb, ba, bb, ta, tb;
        la = this.position.x - Math.floor(this.width * $SQUARE_SIZE / 2);
        lb = object.position.x - Math.floor(this.width * $SQUARE_SIZE / 2);
        ra = this.position.x + Math.floor(this.width * $SQUARE_SIZE / 2);
        rb = object.position.x + Math.floor(this.width * $SQUARE_SIZE / 2);
        ba = this.position.z + Math.floor(this.width * $SQUARE_SIZE / 2);
        bb = object.position.z + Math.floor(this.width * $SQUARE_SIZE / 2);
        ta = this.position.z - Math.floor(this.width * $SQUARE_SIZE / 2);
        tb = object.position.z - Math.floor(this.width * $SQUARE_SIZE / 2);

        return (la < rb && ra > lb && ta < bb && ba > tb);
    },

    // -------------------------------------------------------

    /** Only updates the bounding box mesh position.
    *   @param {THREE.Vector3} position Position to update.
    */
    updateBB: function(position) {
        if (this.currentState.graphicID !== 0) {
            this.boundingBoxSettings.squares = $currentMap.collisions
                [PictureKind.Characters][this.currentState.graphicID]
                [this.getStateIndex()];
        }

        this.boundingBoxSettings.b = new Array;
        var i, l, box;
        this.removeBBFromScene();

        for (i = 0, l = this.boundingBoxSettings.squares.length; i < l; i++) {
            this.boundingBoxSettings.b.push(CollisionSquare.getBB(
                this.boundingBoxSettings.squares[i], this.width, this.height));
            if (this.currentState.graphicKind === ElementMapKind.SpritesFix) {
                box = MapPortion.createBox();
                MapPortion.applyBoxSpriteTransforms(
                    box, [
                        position.x + this.boundingBoxSettings.b[i][0],
                        position.y + this.boundingBoxSettings.b[i][1],
                        position.z + this.boundingBoxSettings.b[i][2],
                        this.boundingBoxSettings.b[i][3],
                        this.boundingBoxSettings.b[i][4],
                    ]);
            }
            else {
                box = MapPortion.createOrientedBox();
                MapPortion.applyOrientedBoxTransforms(
                    box, [
                        position.x + this.boundingBoxSettings.b[i][0],
                        position.y + this.boundingBoxSettings.b[i][1],
                        position.z + this.boundingBoxSettings.b[i][2],
                        this.boundingBoxSettings.b[i][3],
                        this.boundingBoxSettings.b[i][4],
                    ]);
            }
            this.meshBoundingBox.push(box);
        }

        this.addBBToScene();
    },

    // -------------------------------------------------------

    /** Only updates the bounding box mesh position.
    *   @param {THREE.Vector3} position Position to update.
    */
    updateBBPosition: function(position) {
        for (var i = 0, l = this.meshBoundingBox.length; i < l; i++) {
            if (this.currentState.graphicKind === ElementMapKind.SpritesFix) {
                MapPortion.applyBoxSpriteTransforms(
                    this.meshBoundingBox[i], [
                        position.x + this.boundingBoxSettings.b[i][0],
                        position.y + this.boundingBoxSettings.b[i][1],
                        position.z + this.boundingBoxSettings.b[i][2],
                        this.boundingBoxSettings.b[i][3],
                        this.boundingBoxSettings.b[i][4],
                    ]);
            }
            else {
                MapPortion.applyOrientedBoxTransforms(
                    this.meshBoundingBox[i], [
                        position.x + this.boundingBoxSettings.b[i][0],
                        position.y + this.boundingBoxSettings.b[i][1],
                        position.z + this.boundingBoxSettings.b[i][2],
                        this.boundingBoxSettings.b[i][3],
                        this.boundingBoxSettings.b[i][4],
                    ]);
            }
        }
    },

    // -------------------------------------------------------

    /** Move the object (one step).
    *   @param {Orientation} orientation Where to move.
    *   @param {number} limit Max distance to go.
    *   @returns {number} Distance cross.
    */
    move: function(orientation, limit, angle, isCameraOrientation){
        var objects, movedObjects, index;

        // Remove from move
        this.removeMoveTemp();

        // Set position
        var speed = this.speed * MapObject.SPEED_NORMAL * $averageElapsedTime *
            $SQUARE_SIZE;
        if (this.movingVertical !== null && this.movingHorizontal !== null)
            speed *= Math.SQRT1_2;
        var normalDistance = Math.min(limit, speed);
        var position = this.getFuturPosition(orientation, normalDistance, angle);
        var distance = (position === this.position) ? 0 : normalDistance;
        if (isCameraOrientation) {
            orientation = RPM.mod(orientation +
                                $currentMap.camera.getMapOrientation() - 2, 4);
        }
        this.position.set(position.x, position.y, position.z);

        // Update orientation
        this.orientationEye = orientation;
        orientation = this.orientation;
        if (this.currentState.setWithCamera)
            this.updateOrientation();
        if (this.orientation !== orientation)
            this.updateUVs();

        this.moving = true;

        // Add to moving objects
        this.addMoveTemp();

        return [distance, normalDistance];
    },

    // -------------------------------------------------------

    /** Teleport the object.
    *   @param {THREE.Vector3} position Position to teleport.
    */
    teleport: function(position){

        // Remove from move
        this.removeMoveTemp();

        // Set position
        this.position.set(position.x, position.y, position.z);
        this.updateBBPosition(position);
        this.moving = true;

        // Add to moving objects
        this.addMoveTemp();
    },

    // -------------------------------------------------------

    removeMoveTemp: function(){
        var objects, previousPortion, movedObjects, index, mapPortion,
            originalPortion, localPortion;

        if (!this.isHero){
            previousPortion = RPM.getPortion(this.position);
            objects = $game.mapsDatas[$currentMap.id]
                   [previousPortion[0]][previousPortion[1]][previousPortion[2]];

            // Remove from the moved objects in or out of the portion
            movedObjects = objects.mout;
            index = movedObjects.indexOf(this);
            if (index !== -1)
                movedObjects.splice(index, 1);
            movedObjects = objects.min;
            index = movedObjects.indexOf(this);
            if (index !== -1)
                movedObjects.splice(index, 1);

            // Add to moved objects of the original portion if not done yet
            originalPortion = SceneMap.getGlobalPortion(
                        $currentMap.allObjects[this.system.id]);
            objects = $game.mapsDatas[$currentMap.id]
                   [originalPortion[0]][originalPortion[1]][originalPortion[2]];
            movedObjects = objects.m;
            if (movedObjects.indexOf(this) === -1) {
                movedObjects.push(this);
                localPortion = $currentMap.getLocalPortion(originalPortion);
                mapPortion = $currentMap.getMapPortionByPortion(localPortion);
                movedObjects = mapPortion.objectsList;
                index = movedObjects.indexOf(this);
                if (index !== -1)
                    movedObjects.splice(index, 1);
            }
        }
    },

    // -------------------------------------------------------

    addMoveTemp: function(){
        var objects, afterPortion, originalPortion, localPortion;
        afterPortion = RPM.getPortion(this.position);

        if (!this.isHero){
            objects = $game.mapsDatas[$currentMap.id]
                    [afterPortion[0]][afterPortion[1]][afterPortion[2]];
            originalPortion = SceneMap.getGlobalPortion(
                        $currentMap.allObjects[this.system.id]);

            if (originalPortion[0] !== afterPortion[0] ||
                originalPortion[1] !== afterPortion[1] ||
                originalPortion[2] !== afterPortion[2])
            {
                objects.mout.push(this);
            }
            else
                objects.min.push(this);
        }

        // Add or remove from scene
        localPortion = $currentMap.getLocalPortion(afterPortion);
        if ($currentMap.isInPortion(localPortion))
            this.addToScene();
        else
            this.removeFromScene();
    },

    // -------------------------------------------------------

    addToScene: function(){
        if (!this.isInScene && this.mesh !== null) {
            $currentMap.scene.add(this.mesh);
            this.isInScene = true;
        }
    },

    // -------------------------------------------------------

    addBBToScene: function() {
        if ($datasGame.system.showBB) {
            for (var i = 0, l = this.meshBoundingBox.length; i < l; i++)
                $currentMap.scene.add(this.meshBoundingBox[i]);
        }
    },

    // -------------------------------------------------------

    removeFromScene: function(){
        if (this.isInScene) {
            $currentMap.scene.remove(this.mesh);
            this.removeBBFromScene();
            this.isInScene = false;
        }
    },

    // -------------------------------------------------------

    removeBBFromScene: function() {
        if ($datasGame.system.showBB) {
            for (var i = 0, l = this.meshBoundingBox.length; i < l; i++)
                $currentMap.scene.remove(this.meshBoundingBox[i]);
        }

        this.meshBoundingBox = new Array;
    },

    // -------------------------------------------------------

    /** Receive an event.
    *   @param {MapObject} sender The sender of this event.
    *   @param {boolean} isSystem Boolean indicating if it is an event system.
    *   @param {number} eventId ID of the event.
    *   @param {SystemParameter[]} parameters List of all the parameters.
    *   @param {numbers[]} states List of all the current states of the object.
    */
    receiveEvent: function(sender, isSystem, idEvent, parameters, states){
        var i, j, l, ll;

        for (i = 0, l = states.length; i < l; i++){
            var state = states[i];
            var reactions = this.system.getReactions(isSystem, idEvent,
                                                     states[i], parameters);

            for (j = 0, ll = reactions.length; j < ll; j++) {
                SceneGame.prototype.addReaction.call($gameStack.top(), sender,
                                                     reactions[j], this, state);
            }
        }
    },

    // -------------------------------------------------------

    /** Update the object graphics.
    */
    update: function(angle){
        if (this.mesh !== null){
            var frame = this.frame;
            var orientation = this.orientation;

            if (this.moving){

                // If moving, update frame
                if (this.currentState.moveAnimation){
                    this.frameTick += $elapsedTime;
                    if (this.frameTick >= this.frameDuration){
                        this.frame = (this.frame + 1) % $FRAMES;
                        this.frameTick = 0;
                    }
                }

                // Update mesh position
                var offset = (this.currentState.pixelOffset &&
                              this.frame % 2 !== 0) ? 1 : 0;
                this.mesh.position.set(this.position.x,
                                       this.position.y + offset,
                                       this.position.z);
                //this.updateBBPosition(this.position);
                this.moving = false;
                this.movingVertical = null;
                this.movingHorizontal = null;
            }
            else {
                this.frame = this.currentState.indexX;

                // Update angle
                if (this.currentState.setWithCamera)
                    this.updateOrientation();
            }

            this.updateAngle(angle);

            // Update mesh
            if (frame !== this.frame || orientation !== this.orientation)
                this.updateUVs();
        }
    },

    // -------------------------------------------------------

    /** Update the move states to know if diagonal move is needed.
    */
    updateMoveStates: function(orientation) {
        switch (orientation) {
        case Orientation.South:
        case Orientation.North:
            this.movingVertical = orientation;
            break;
        case Orientation.West:
        case Orientation.East:
            this.movingHorizontal = orientation;
            break;
        }
    },

    // -------------------------------------------------------

    /** Update the Y angle (for face sprites).
    *   @param {number} angle The angle on the Y axis.
    */
    updateAngle: function(angle){
        if (this.currentState.graphicKind === ElementMapKind.SpritesFace)
            this.mesh.rotation.y = angle;
    },

    // -------------------------------------------------------

    /** Update the orientation according to the camera position
    */
    updateOrientation: function(){
        this.orientation = RPM.mod(($currentMap.orientation - 2) * 3 +
                                     this.orientationEye, 4);
    },

    // -------------------------------------------------------

    /** Update the UVs coordinates according to frame and orientation.
    */
    updateUVs: function(){
        if (this.mesh !== null && !this.isNone()) {
            var textureWidth, textureHeight;
            var x, y, w, h;

            if (this.mesh.material && this.mesh.material.map) {
                textureWidth = this.mesh.material.map.image.width;
                textureHeight = this.mesh.material.map.image.height;
                if (this.currentState.graphicID === 0) {
                    w = this.width * $SQUARE_SIZE / textureWidth;
                    h = this.height * $SQUARE_SIZE / textureHeight;
                    x = this.currentState.rectTileset[0] * $SQUARE_SIZE /
                        textureWidth;
                    y = this.currentState.rectTileset[1] * $SQUARE_SIZE /
                        textureHeight;
                } else {
                    w = this.width * $SQUARE_SIZE / textureWidth;
                    h = this.height * $SQUARE_SIZE / textureHeight;
                    x = this.frame * w;
                    y = this.orientation * h;
                }

                // Update geometry
                this.mesh.geometry.faceVertexUvs[0][0][0].set(x, y);
                this.mesh.geometry.faceVertexUvs[0][0][1].set(x + w, y);
                this.mesh.geometry.faceVertexUvs[0][0][2].set(x + w, y + h);
                this.mesh.geometry.faceVertexUvs[0][1][0].set(x, y);
                this.mesh.geometry.faceVertexUvs[0][1][1].set(x + w, y + h);
                this.mesh.geometry.faceVertexUvs[0][1][2].set(x, y + h);
                this.mesh.geometry.uvsNeedUpdate = true;
            }
        }
    },

    // -------------------------------------------------------

    /** Update the material.
    */
    updateMaterial: function(){
        if (!this.isNone()){
            this.mesh.material = this.currentState.graphicID === 0 ?
                $currentMap.textureTileset : $currentMap.texturesCharacters[
                this.currentState.graphicID];
        } else {
            this.mesh = null;
        }
    },

    // -------------------------------------------------------

    getStateIndex: function() {
        return this.frame + (this.orientation * $FRAMES);
    },

    // -------------------------------------------------------

    isNone: function() {
        return this.currentState.graphicKind === ElementMapKind.None ||
               this.currentState.graphicID === -1;
    }
}
