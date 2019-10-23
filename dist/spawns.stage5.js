/* DOCS: stage 5
 * Nothing major happens at this stage
 * This relies on existing infrastructure placed by the player.
*/

//TODO: allow new behaviours after spawn
//TODO: link code
//TODO: use Traveller.js?

const { STAGE_5_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	HARVEST, UPGRADE, PICKUP, DROP, DEPOSIT, WITHDRAW, BUILD, REPAIR,
	PATROL, TARGET, FEAR, BRAVE, CRY, CARE, HEALER, CLAIMER,
} = require("behaviour_names");

const {
	TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE,
} = require("store.utils");

const { schematicBuild } = require("schematic");
const { serialize } = require("behaviour.fear");

//assume 1800 is available
const claimerBody = [ //1300
	MOVE, MOVE, CLAIM, CLAIM,
];

const tankBody = [ //1680
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //100
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,

	TOUGH, TOUGH, //20

	MOVE, MOVE, MOVE, MOVE, MOVE, //500
	MOVE, MOVE, MOVE, MOVE, MOVE,

	MOVE, MOVE, //100

	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, //800
	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,

	ATTACK, ATTACK, //160

//	RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, //900
//	RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
];

const healerBody = [
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, //300

	HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, //1250
];

const specializedHarvesterBody = [ //800
	//50 * 5 = 250
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 1 = 50
	CARRY,

	//100 * 5 = 500
	WORK, WORK, WORK, WORK, WORK,
];

const specializedLorryBody = [ //1500
	//50 * 10 = 500
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 20 = 1000
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
];

const tinyLorry = [ //300
	//50
	MOVE,

	//250
	CARRY, CARRY, CARRY, CARRY, CARRY,
];

const hugeWorkerBody = [ //1750
	//50 * 15 = 750
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 10 = 500
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,

	//100 * 5 = 500
	WORK, WORK, WORK, WORK, WORK,
];

function run(spawn, crash) {
	//place the construction sites every so often
	if (Game.time % 20 == 0) {
		if (schematicBuild(spawn, "schematic.defense") != 0) {
			Game.notify("schematicBuild returned a non-zero value (defense stage 5)");
		}

		if (schematicBuild(spawn, "schematic.extensions") != 0) {
			Game.notify("schematicBuild returned a non-zero value (extensions stage 5)");
		}

		if (schematicBuild(spawn, "schematic.infrastructure") != 0) {
			Game.notify("schematicBuild returned a non-zero value (infrastructure stage 5)");
		}
	}

	//work on the creeps
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 6 && !crash) {
		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 2) {
			return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, WITHDRAW, HARVEST, PATROL], hugeWorkerBody, {
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
				WITHDRAW: {
					stores: [CONTAINER, STORAGE]
				},
				HARVEST: {
					skipOnFull: true,
				},
				PATROL: {
					targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
				}
			});
		}
	}

	//spawn harvesters (enough to support the guards)
	if (!tags.harvester || tags.harvester < 4) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, REPAIR, BUILD, HARVEST], specializedHarvesterBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			REPAIR: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			BUILD: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			HARVEST: {
//				lockToSource: true
			}
		});
	}

//	if ((!tags.claimer || tags.claimer < 1) && Game.flags["claimme"]) {
//		return spawnCreep(spawn, "claimer", ["claimer"], [TARGET, CLAIMER], claimerBody, {
//			TARGET: {
//				targetFlag: "claimme",
//				stopInRoom: true
//			}
//		});
//	}

	//BUG: getPopulationByTags() doesn't recognize the other spawn
//	if ((!tags.colonist || tags.colonist < 4) && Game.flags["claimme"]) {
//		return spawnCreep(spawn, "colonist", ["colonist"], [TARGET, HARVEST, BUILD], largeWorkerBody, {
//			TARGET: {
//				targetFlag: "claimme",
//				stopInRoom: true
//			},
//			HARVEST: {
//				skipOnFull: true,
//			}
//			origin: "Spawn2"
//		})
//	}

	if ((!tags.tank || tags.tank < 1) && Game.flags['attackme']) {
		return spawnCreep(spawn, "tank", ["tank", "nocrash"], [CRY, BRAVE, TARGET], tankBody, {
			TARGET: {
				targetFlag: 'attackme'
			}
		});
	}

	if ((!tags.healer || tags.healer < 1) && Game.flags["attackme"]) {
		return spawnCreep(spawn, "healer", ["healer", "nocrash"], [CRY, HEALER, TARGET], healerBody, {
			TARGET: {
				targetFlag: 'attackme'
			}
		});
	}

	//home lorry (only works in spawn)
	if (!tags.homeLorry || tags.homeLorry < 2) {
		//NOTE: not immediately returning this result
		let result = spawnCreep(spawn, "homeLorry", ["homeLorry"], [CRY, DEPOSIT, PICKUP, WITHDRAW], specializedLorryBody, {
			DEPOSIT: {
				returnHomeFirst: true,
				stores: [EXTENSION, SPAWN, TOWER, STORAGE]
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			}
		});

		//not enough energy for a lorry, spawn a tiny lorry
		if (result == ERR_NOT_ENOUGH_ENERGY && (!tags.tinyLorry || tags.tinyLorry < 2)) {
			return spawnCreep(spawn, "tinyLorry", ["tinyLorry", "tiny"], [CRY, DEPOSIT, PICKUP, WITHDRAW], tinyLorry, {
				DEPOSIT: {
					returnHomeFirst: true,
					stores: [EXTENSION, SPAWN, TOWER, STORAGE]
				},
				WITHDRAW: {
					stores: [CONTAINER, STORAGE]
				}
			});
		}
	}

	//lorry
	if (!tags.lorry || tags.lorry < 4) {
		return spawnCreep(spawn, "lorry", ["lorry"], [CRY, FEAR, DEPOSIT, PICKUP, WITHDRAW, PATROL], specializedLorryBody, {
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
				stores: [EXTENSION, SPAWN, TOWER, STORAGE]
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

	//guards when someone cries for help
	if ((!tags.guard || tags.guard < 1) && Memory._cries.length > 0) { //TODO: origin-based cries
		return spawnCreep(spawn, "guard", ["guard"], [CARE, BRAVE, PATROL], tankBody, {
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	//spawn MORE harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, REPAIR, BUILD, HARVEST], specializedHarvesterBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			REPAIR: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			BUILD: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			HARVEST: {
//				lockToSource: true
			}
		});
	}

	//spawn upgraders
	if ((!tags.upgrader || tags.upgrader < 4) && spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] > 10000) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [CRY, FEAR, WITHDRAW, UPGRADE], hugeWorkerBody, {
			FEAR: {
				onSafe: serialize(c => null)
			},
			WITHDRAW: {
				stores: [STORAGE]
			}
		});
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 2) {
		return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, WITHDRAW, HARVEST, PATROL], hugeWorkerBody, {
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
			REPAIR: {
				wallHealth: 100000,
				rampartHealth: 100000,
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			},
			HARVEST: {
				skipOnFull: true,
			},
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}
}

module.exports = run;
