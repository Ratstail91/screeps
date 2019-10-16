/* DOCS: stage 3
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_3_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, WITHDRAW, HARVEST, UPGRADE, BUILD, REPAIR,
	FEAR, BRAVE, PATROL, TARGET,
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
	MOVE, MOVE, MOVE, MOVE, MOVE, //250

	ATTACK, ATTACK, ATTACK, //240

//	HEAL, HEAL, //500
];

function run(spawn) {
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

	//claim nearby rooms (high priority)
	//TODO: better claim & reserver code
//	if (!tags.claimer || tags.claimer < 1) {
//		return spawnCreep(spawn, "claimer", ["claimer"], [TARGET, CLAIMER], claimerBody, {
//			CLAIMER: {
//				claim: true
//			},
//			TARGET: {
//				targetFlag: "claimme",
//				stopInRoom: true
//			}
//		});
//	}

	if (!tags.reserver1 || tags.reserver1 < 1) {
		return spawnCreep(spawn, "reserver1", ["reserver1"], [TARGET, CLAIMER], claimerBody, {
			TARGET: {
				targetFlag: "reserveme1",
				stopInRoom: true
			}
		});
	}

	if (!tags.reserver2 || tags.reserver2 < 1) {
		return spawnCreep(spawn, "reserver2", ["reserver2"], [TARGET, CLAIMER], claimerBody, {
			TARGET: {
				targetFlag: "reserveme2",
				stopInRoom: true
			}
		});
	}

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 4) {
		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 4) {
			return spawnCreep(spawn, "builder", ["builder"], [FEAR, REPAIR, BUILD, HARVEST, UPGRADE], mediumBody, {
				FEAR: {
					onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
				},
				HARVEST: {
					remote: 0,
					source: null
				}
			});
		}
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 4) {
		return spawnCreep(spawn, "harvester", ["harvester"], [FEAR, PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}

	//lorry
	if (!tags.lorry || tags.lorry < 1) {
		return spawnCreep(spawn, "lorry", ["lorry"], [DEPOSIT, WITHDRAW], lorryBody, {
			DEPOSIT: {
				stores: [EXTENSION, SPAWN, TOWER]
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			}
		});
	}

//	//TMP
//	if (!tags.attacker || tags.attacker < 2) {
//		return spawnCreep(spawn, "attacker", ["attacker"], [BRAVE, TARGET], guardBody, {
//			TARGET: {
//				targetFlag: 'attackme'
//			}
//		});
//	}

	if (!tags.guard || tags.guard < 4) {
		return spawnCreep(spawn, "guard", ["guard"], [BRAVE, PATROL], guardBody, {
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	if (!tags.colonist || tags.colonist < 10) {
		return spawnCreep(spawn, "colonist", ["colonist"], [PICKUP, BUILD, HARVEST, TARGET], mediumBody, {
			TARGET: {
				targetFlag: 'claimme'
			}
		});
	}

	//spawn MORE harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [FEAR, PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 5) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [FEAR, PICKUP, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 2) {
		return spawnCreep(spawn, "builder", ["builder"], [FEAR, REPAIR, BUILD, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			}
		});
	}
}

module.exports = run;
