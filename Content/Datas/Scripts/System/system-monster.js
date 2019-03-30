/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

// -------------------------------------------------------
//
//  CLASS SystemMonster : SystemHero
//
// -------------------------------------------------------

/** @class
*   A monster of the game.
*   @extends SystemHero
*/
function SystemMonster(){
    SystemHero.call(this);
}

SystemMonster.prototype = Object.create(SystemHero.prototype);

// -------------------------------------------------------

SystemMonster.prototype.readJSON = function(json) {
    SystemHero.prototype.readJSON.call(this, json);
    var i, hash, currenciesLength, jsonCurrencies, progression, jsonLoots,
        lootsLength, loot;

    jsonCurrencies = json.cur;
    currenciesLength = jsonCurrencies.length;
    jsonLoots = json.loots;
    lootsLength = jsonLoots.length;
    this.rewards = {
        xp: new SystemProgressionTable(this.getProperty("finalLevel")),
        currencies: new Array(currenciesLength),
        loots: new Array(lootsLength)
    }

    // Experience
    this.rewards.xp.readJSON(json.xp);

    // Currencies
    for (i = 0; i < currenciesLength; i++) {
        hash = jsonCurrencies[i];
        progression = new SystemProgressionTable(hash.k);
        progression.readJSON(hash.v);
        this.rewards.currencies[i] = progression;
    }

    // Loots
    for (i = 0; i < lootsLength; i++) {
        loot = new SystemLoot();
        loot.readJSON(jsonLoots[i]);
        this.rewards.loots[i] = loot;
    }
}

// -------------------------------------------------------

SystemMonster.prototype.getRewardExperience = function(level) {
    return this.rewards.xp.getProgressionAt(level, this.getProperty(
        "finalLevel"));
}

// -------------------------------------------------------

SystemMonster.prototype.getRewardCurrencies = function(level) {
    var i, l, currencies, progression;
    currencies = {};
    for (i = 0, l = this.rewards.currencies.length; i < l; i++) {
        progression = this.rewards.currencies[i];
        currencies[progression.id] = progression.getProgressionAt(level, this
            .getProperty("finalLevel"));
    }

    return currencies;
}

// -------------------------------------------------------

SystemMonster.prototype.getRewardLoots = function(level) {
    var i, l, loots, loot, list;

    list = new Array(3);
    list[LootKind.Item] = {};
    list[LootKind.Weapon] = {};
    list[LootKind.Armor] = {};

    for (i = 0, l = this.rewards.loots.length; i < l; i++) {
        loot = this.rewards.loots[i].currenLoot(level);
        if (loot !== null) {
            loots = list[loot.k];
            if (loots.hasOwnProperty(loot.id)) {
                loots[loot.id] += loot.nb;
            } else {
                loots[loot.id] = loot.nb;
            }
        }
    }

    return list;
}
