/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

// -------------------------------------------------------
//
//  CLASS DatasSpecialElements
//
// -------------------------------------------------------

/** @class
*   All the special elements datas.
*   @property {SystemWall[]} walls List of all the walls of the game
*   according to ID.
*   @property {SystemAutotile[]} autotiles List of all the autotiles of the game
*    according to ID.
*/
function DatasSpecialElements(){
    this.read();
}

DatasSpecialElements.prototype = {

    /** Read the JSON file associated to pictures.
    */
    read: function(){
        RPM.openFile(this, RPM.FILE_SPECIAL_ELEMENTS, true, function(res){
            var json, jsonAutotiles, jsonAutotile, jsonWalls, jsonWall;
            var autotile, wall;
            var i, l, id;

            json = JSON.parse(res);

            // Autotiles
            jsonAutotiles = json.autotiles;
            l = jsonAutotiles.length;
            this.autotiles = new Array(l+1);
            for (i = 0; i < l; i++){
                jsonAutotile = jsonAutotiles[i];
                id = jsonAutotile.id;
                autotile = new SystemAutotile();
                autotile.readJSON(jsonAutotile);
                this.autotiles[id] = autotile;
            }

            // Walls
            jsonWalls = json.walls;
            l = jsonWalls.length;
            this.walls = new Array(l+1);
            for (i = 0; i < l; i++){
                jsonWall = jsonWalls[i];
                id = jsonWall.id;
                wall = new SystemWall();
                wall.readJSON(jsonWall);
                this.walls[id] = wall;
            }
        });
    }
}
