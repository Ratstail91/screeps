/* DOCS: stage 6
 * This stage is a big turning point in the game.
 * This relies on existing infrastructure placed by the player.
*/

const { STAGE_6_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags, countRemotes } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	HARVEST, UPGRADE, PICKUP, DROP, DEPOSIT, WITHDRAW, BUILD, REPAIR,
	PATROL, TARGET, FEAR, BRAVE, CRY, CARE, HEALER, CLAIMER,
} = require("behaviour_names");

const {
	TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE, TERMINAL,
} = require("store.utils");

const { schematicBuild } = require("schematic");
const { serialize } = require("behaviour.fear");

//assume 2300 is available
const claimerBody = [ //1300
	MOVE, MOVE, CLAIM, CLAIM,
];

const tankBody = [ //2300
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //50

	MOVE, MOVE, MOVE, MOVE, MOVE, //500
	MOVE, MOVE, MOVE, MOVE, MOVE,

	MOVE, MOVE, MOVE, //150

	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, //800
	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,

	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, //800
	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
];

const healerBody = [ //1550
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

const specializedLorryBody = [ //2250
	//50 * 10 = 750
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,

	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 30 = 1500
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,

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

	//certain creeps don't spawn below this storage number
	const energyThreshold = 20000;

	//work on the creeps
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 7 && !crash) {
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
				onSafe: serialize(c => {
					if (!c.memory['HARVEST'].lockToSource) {
						c.memory['HARVEST'].remote = null;
						c.memory['HARVEST'].source = null;
					}
				})
			},
			REPAIR: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			BUILD: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			HARVEST: {
				remote: Memory.spawns[spawn.name].harvestCounter++ % countRemotes(spawn.name),
				lockToSource: true
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
	if (!tags.homeLorry || tags.homeLorry < 1) {
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

		//not enough energy for a home lorry, spawn a tiny lorry
		if (result == ERR_NOT_ENOUGH_ENERGY && (!tags.tinyLorry || tags.tinyLorry < 4)) {
			let behaviours;
			let extraTags = [];

			//only one creep should lack the PICKUP behaviour
			if (!tags.nopickup || tags.nopickup < 1) {
				behaviours = [CRY, DEPOSIT, WITHDRAW];
				extraTags.push("nopickup");
			} else {
				behaviours = [CRY, DEPOSIT, PICKUP, WITHDRAW];
			}

			return spawnCreep(spawn, "tinyLorry", ["tinyLorry", "tiny", ...extraTags], behaviours, tinyLorry, {
				DEPOSIT: {
					returnHomeFirst: true,
					stores: [EXTENSION, SPAWN, TOWER, STORAGE]
				},
				WITHDRAW: {
					stores: [CONTAINER, STORAGE]
				}
			});
		}
	} else {
		//clean up the tiny lorries
		creeps.filter(c => c.memory.tags.indexOf("tinyLorry") != -1)
			.forEach(c => c.suicide())
			;
	}

	//lorry
	if (!tags.lorry || tags.lorry < 4) {
		return spawnCreep(spawn, "lorry", ["lorry"], [CRY, FEAR, DEPOSIT, WITHDRAW, PATROL], specializedLorryBody, {
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
				stores: [STORAGE]
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE],
				skipOriginRoom: true,
				continueOnSuccess: true,
			},
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes),
				stopInRoom: true,
			}
		});
	}

	//trader
//	if ((!tags.trader || tags.trader < 1) && spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= energyThreshold) {
//		return spawnCreep(spawn, "trader", ["trader"], [DEPOSIT, WITHDRAW], tinyLorry, {
//			DEPOSIT: {
//				stores: [TERMINAL]
//			},
//			WITHDRAW: {
//				stores: [STORAGE]
//			}
//		});
//	}

	//guards when someone cries for help
	if ((!tags.guard || tags.guard < 1) && Memory._cries.length > 0) { //TODO: origin-based cries
		return spawnCreep(spawn, "guard", ["guard"], [CARE, BRAVE, PATROL], tankBody, {
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	//spawn MORE harvesters
	if (!tags.harvester || tags.harvester < 6) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, REPAIR, BUILD, HARVEST], specializedHarvesterBody, {
			FEAR: {
				onSafe: serialize(c => {
					if (!c.memory['HARVEST'].lockToSource) {
						c.memory['HARVEST'].remote = null;
						c.memory['HARVEST'].source = null;
					}
				})
			},
			REPAIR: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			BUILD: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			HARVEST: {
				remote: Memory.spawns[spawn.name].harvestCounter++ % countRemotes(spawn.name),
				lockToSource: true
			}
		});
	}

	//spawn upgraders
	if ((!tags.upgrader || tags.upgrader < 4) && spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] > energyThreshold) {
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
	if (!tags.builder || tags.builder < 4) {
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
				wallHealth: 200000,
				rampartHealth: 250000,
			},
			WITHDRAW: {
				stores: [STORAGE, CONTAINER]
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

const profiler = require('screepers.profiler');

module.exports = profiler.registerFN(run, "spawns.stage6");
