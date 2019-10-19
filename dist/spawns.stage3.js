/* DOCS: stage 3
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_3_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, WITHDRAW, HARVEST, UPGRADE, BUILD, REPAIR,
	FEAR, BRAVE, PATROL, TARGET, CRY, CARE,
	CLAIMER,
} = require("behaviour_names");

const {
	TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE,
} = require("store.utils");

const { schematicBuild } = require("schematic");
const { serialize } = require("behaviour.fear");

//assume 800 is available - medium body is 800e
const claimerBody = [ //650
	MOVE, CLAIM,
];

const mediumBody = [ //800
	CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK,
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
];

const lorryBody = [ //800
	CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
];

const guardBody = [
//	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //50

	MOVE, MOVE, MOVE, //150

	ATTACK, ATTACK, ATTACK, //240

//	HEAL, HEAL, //500
];

function run(spawn, crash) {
	//place the construction sites every so often
	if (Game.time % 20 == 0) {
		if (schematicBuild(spawn, "schematic.defense") != 0) {
			Game.notify("schematicBuild returned a non-zero value (defense stage 3)");
		}

		if (schematicBuild(spawn, "schematic.extensions") != 0) {
			Game.notify("schematicBuild returned a non-zero value (extensions stage 3)");
		}

		if (schematicBuild(spawn, "schematic.infrastructure") != 0) {
			Game.notify("schematicBuild returned a non-zero value (infrastructure stage 3)");
		}
	}

	//work on the creeps
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//TODO: better claim & reserver code

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 4 && !crash) {
		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 10) {
			return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, HARVEST, PATROL], mediumBody, {
				FEAR: {
					onSafe: serialize(c => {
						c.memory['HARVEST'].remote = null;
						c.memory['HARVEST'].source = null;

						c.memory['PATROL']._targetCounter++;
						if (c.memory['PATROL']._targetCounter >= c.memory['PATROL'].targetFlags.length) {
							c.memory['PATROL']._targetCounter = 0;
						}
					})
				},
				PATROL: {
					targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
				}
			});
		}
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 4) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}

	//lorry
	if (!tags.lorry || tags.lorry < 1) {
		return spawnCreep(spawn, "lorry", ["lorry"], [CRY, FEAR, DEPOSIT, WITHDRAW, PATROL], lorryBody, {
			FEAR: {
				onSafe: serialize(c => {
					c.memory['PATROL']._targetCounter++;
					if (c.memory['PATROL']._targetCounter >= c.memory['PATROL'].targetFlags.length) {
						c.memory['PATROL']._targetCounter = 0;
					}
				})
			},
			DEPOSIT: {
				returnHomeFirst: true,
				stores: [EXTENSION, SPAWN, TOWER]
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE],
				skipOriginRoom: true,
			},
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	if (!tags.guard || tags.guard < 2) {
		return spawnCreep(spawn, "guard", ["guard"], [CRY, CARE, BRAVE, PATROL], guardBody, {
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	//spawn MORE harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 2) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [CRY, FEAR, PICKUP, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 2) {
		return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, HARVEST, PATROL], mediumBody, {
			FEAR: {
				onSafe: serialize(c => {
					c.memory['HARVEST'].remote = null;
					c.memory['HARVEST'].source = null;

					c.memory['PATROL']._targetCounter++;
					if (c.memory['PATROL']._targetCounter >= c.memory['PATROL'].targetFlags.length) {
						c.memory['PATROL']._targetCounter = 0;
					}
				})
			},
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}
}

module.exports = run;
