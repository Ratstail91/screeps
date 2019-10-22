/* DOCS: stage 5
 * Nothing major happens at this stage
 * This relies on existing infrastructure placed by the player.
*/

//TODO: allow new behaviours after spawn

const { STAGE_5_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, WITHDRAW, HARVEST, UPGRADE, BUILD, REPAIR,
	TARGET, PATROL, BRAVE, FEAR, HEALER, CRY, CARE, CLAIMER,
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

const guardBody = [
	MOVE, MOVE, MOVE, MOVE, MOVE, //250

	ATTACK, ATTACK, ATTACK, //240
];

const attackerBody = [
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //50

	MOVE, MOVE, MOVE, MOVE, MOVE, //250
	MOVE, MOVE, MOVE, MOVE, MOVE, //250

	ATTACK, ATTACK, ATTACK, //240
];

const healerBody = [
	MOVE, MOVE, MOVE, MOVE, MOVE, //250

	HEAL, HEAL, HEAL, HEAL, //1000
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
			return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, HARVEST, PATROL], hugeWorkerBody, {
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

	//spawn harvesters (enough to support the guards)
	if (!tags.harvester || tags.harvester < 4) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], specializedHarvesterBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			REPAIR: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			BUILD: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			DEPOSIT: {
				stores: [CONTAINER, STORAGE]
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
//			origin: "Spawn2"
//		})
//	}

//	if ((!tags.healer || tags.healer < 10) && Game.flags["attackme"]) {
//		return spawnCreep(spawn, "healer", ["healer"], [CRY, CARE, HEALER, TARGET], healerBody, {
//			TARGET: {
//				targetFlag: 'attackme'
//			}
//		});
//	}

//	if ((!tags.attacker || tags.attacker < 15) && Game.flags['attackme']) {
//		return spawnCreep(spawn, "attacker", ["attacker"], [CRY, CARE, BRAVE, TARGET], attackerBody, {
//			TARGET: {
//				targetFlag: 'attackme'
//			}
//		});
//	}

	//home lorry (only works in spawn)
	if (!tags.homeLorry || tags.homeLorry < 2) {
		//NOTE: not immediately returning this result
		let result = spawnCreep(spawn, "homeLorry", ["homeLorry"], [CRY, PICKUP, DEPOSIT, WITHDRAW], specializedLorryBody, {
			DEPOSIT: {
				returnHomeFirst: true,
				stores: [EXTENSION, SPAWN, TOWER, STORAGE]
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			}
		});

		//not enough energy for a lorry, spawn a tiny lorry
		//TODO: timer on this?
		if (result == ERR_NOT_ENOUGH_ENERGY) {
			return spawnCreep(spawn, "tinyLorry", ["tinyLorry", "homeLorry", "tiny"], [CRY, PICKUP, DEPOSIT, WITHDRAW], tinyLorry, {
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
	if (!tags.lorry || tags.lorry < 2) {
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
				stores: [EXTENSION, SPAWN, TOWER, CONTAINER, STORAGE]
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
	if (!tags.harvester || tags.harvester < 8) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], specializedHarvesterBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			REPAIR: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			BUILD: {
				structures: [STRUCTURE_CONTAINER, STRUCTURE_STORAGE]
			},
			DEPOSIT: {
				stores: [CONTAINER, STORAGE]
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 4) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [CRY, FEAR, WITHDRAW, HARVEST, UPGRADE], hugeWorkerBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			}
		});
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 2) {
		return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, HARVEST, PATROL], hugeWorkerBody, {
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
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}
}

module.exports = run;
