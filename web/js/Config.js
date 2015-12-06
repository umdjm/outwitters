var MapEditor = MapEditor || {};

MapEditor.Config = {

    "Runner":{
        ATTACK_STRENGTH: 1,
        ATTACK_RANGE: 1,
        RANGE: 5,
        INITIAL_HEALTH: 1,
        MAX_HEALTH: 2,
        SPAWN_COST: 1
    },
    "Soldier":{
        ATTACK_STRENGTH: 2,
        ATTACK_RANGE: 1,
        RANGE: 3,
        INITIAL_HEALTH: 3,
        MAX_HEALTH: 4,
        SPAWN_COST: 2
    },
    "Heavy":{
        ATTACK_STRENGTH: 3,
        ATTACK_RANGE: 1,
        RANGE: 2,
        INITIAL_HEALTH: 4,
        MAX_HEALTH: 5,
        SPAWN_COST: 4
    },
    "Sniper":{
        ATTACK_STRENGTH: 3,
        ATTACK_RANGE: 3,
        RANGE: 1,
        INITIAL_HEALTH: 1,
        MAX_HEALTH: 2,
        SPAWN_COST: 3
    },
    "Medic": {
        ATTACK_STRENGTH: 0,
        ATTACK_RANGE: 1,
        RANGE: 3,
        INITIAL_HEALTH: 1,
        MAX_HEALTH: 2,
        SPAWN_COST: 2
    },
    "Bombshell":{
        ATTACK_STRENGTH: 3,
        ATTACK_RANGE: 3,
        RANGE: 3,
        INITIAL_HEALTH: 1,
        MAX_HEALTH: 2,
        SPAWN_COST: 7
    },
    "Bombshelled":{
        ATTACK_STRENGTH: 3,
        ATTACK_RANGE: 3,
        RANGE: 0,
        INITIAL_HEALTH: 3,
        MAX_HEALTH: 4,
        SPAWN_COST: 0
    },
    "Bramble":{
        ATTACK_STRENGTH: 0,
        ATTACK_RANGE: 1,
        RANGE: 3,
        INITIAL_HEALTH: 1,
        MAX_HEALTH: 2,
        SPAWN_COST: 7
    },
    "Scrambler":{
        ATTACK_STRENGTH: 0,
        ATTACK_RANGE: 1,
        RANGE: 3,
        INITIAL_HEALTH: 1,
        MAX_HEALTH: 2,
        SPAWN_COST: 7
    },
    "Mobi":{
        ATTACK_STRENGTH: 0,
        ATTACK_RANGE: 1,
        RANGE: 3,
        INITIAL_HEALTH: 2,
        MAX_HEALTH: 3,
        SPAWN_COST: 7
    }
};