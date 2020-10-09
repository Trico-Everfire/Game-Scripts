/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

/** @class
*   A chrono in the game
*/
class Chrono
{
    constructor(start)
    {
        this.time = start;
        this.lastTime = new Date().getTime();
    }

    update()
    {
        let date = new Date().getTime();
        this.time += date - this.lastTime;
        this.lastTime = date;
    }

    getSeconds()
    {
        return Math.floor(this.time / 1000);
    }
}
