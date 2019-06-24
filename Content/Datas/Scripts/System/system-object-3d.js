/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

// -------------------------------------------------------
//
//  CLASS SystemObject3D
//
// -------------------------------------------------------

/** @class
*   A 3D object of the game.
*   @property {number} picutreID The picture ID of the object 3D.
*/
function SystemObject3D(){

}

SystemObject3D.prototype = {

    /** Read the JSON associated to the object 3D.
    *   @param {Object} json Json object describing the object.
    */
    readJSON: function(json) {
        this.id = json.id;
        this.shapeKind = typeof json.sk === 'undefined' ? ShapeKind.Box : json
            .sk;
        this.objID = typeof json.oid === 'undefined' ? -1 : json.oid;
        this.mtlID = typeof json.mid === 'undefined' ? -1 : json.mid;
        this.pictureID = typeof json.pic === 'undefined' ? -1 : json.pic;
        this.collisionKind = typeof json.ck === 'undefined' ?
            ObjectCollisionKind.None : json.ck;
        this.collisionCustomID = typeof json.ccid === 'undefined' ? -1 : json
            .ccid;
        this.scale = typeof json.s === 'undefined' ? 1 : json.s;
        this.widthSquare = typeof json.ws === 'undefined' ? 1 : json.ws;
        this.widthPixel = typeof json.wp === 'undefined' ? 0 : json.wp;
        this.heightSquare = typeof json.hs === 'undefined' ? 1 : json.hs;
        this.heightPixel = typeof json.hp === 'undefined' ? 0 : json.hp;
        this.depthSquare = typeof json.ds === 'undefined' ? 1 : json.ds;
        this.depthPixel = typeof json.dp === 'undefined' ? 0 : json.dp;
        this.stretch = typeof json.st === 'undefined' ? false : json.st;
    },

    // -------------------------------------------------------

    widthPixels: function() {
        return this.widthSquare * $SQUARE_SIZE + this.widthPixel;
    },

    // -------------------------------------------------------

    heightPixels: function() {
        return this.heightSquare * $SQUARE_SIZE + this.heightPixel;
    },

    // -------------------------------------------------------

    depthPixels: function() {
        return this.depthSquare * $SQUARE_SIZE + this.depthPixel;
    },

    // -------------------------------------------------------

    getSizeVector: function() {
        return new THREE.Vector3(this.widthPixels(), this.heightPixels(), this
            .depthPixels());
    }
}
