/* DOCS: stage 4
 * This stage switches to using canister mining.
 * This relies on existing infrastructure placed by the player.
*/

const { STAGE_4_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, WITHDRAW, HARVEST, UPGRADE, BUILD, REPAIR,
	TARGET, PATROL, BRAVE, FEAR, CRY, CARE, CLAIMER,
} = require("behaviour_names");

const {
	TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE,
} = require("store.utils");

const { schematicBuild } = require("schematic");
const { serialize } = require("behaviour.fear");

//assume 1300 is available
const claimerBody = [ //1300
	MOVE, MOVE, CLAIM, CLAIM,
];

const guardBody = [
	MOVE, MOVE, MOVE, MOVE, MOVE, //250

	ATTACK, ATTACK, ATTACK, //240

//	HEAL, HEAL, //500 //TODO: heal
];

const specializedHarvesterBody = [ //800
	//50 * 5 = 250
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 1 = 50
	CARRY,

	//100 * 5 = 500
	WORK, WORK, WORK, WORK, WORK,
];

const specializedLorryBody = [ //1200
	//50 * 8 = 400
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE,

	//50 * 16 = 800
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY,
];

const largeWorkerBody = [ //1250
	//50 * 10 = 500
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 5 = 250
	CARRY, CARRY, CARRY, CARRY, CARRY,

	//100 * 5 = 500
	WORK, WORK, WORK, WORK, WORK,
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
//	if (!tags.claimer || tags.claimer < 1) {
//		return spawnCreep(spawn, "claimer", ["claimer"], [CRY, TARGET, CLAIMER], claimerBody, {
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
		return spawnCreep(spawn, "reserver1", ["reserver1"], [CRY, TARGET, CLAIMER], claimerBody, {
			TARGET: {
				targetFlag: "reserveme1",
				stopInRoom: true
			}
		});
	}

	if (!tags.reserver2 || tags.reserver2 < 1) {
		return spawnCreep(spawn, "reserver2", ["reserver2"], [CRY, TARGET, CLAIMER], claimerBody, {
			TARGET: {
				targetFlag: "reserveme2",
				stopInRoom: true
			}
		});
	}

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 5) {
		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 6) {
			return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, WITHDRAW, PATROL], largeWorkerBody, {
				FEAR: {
					onSafe: serialize(c => {
						c.memory['PATROL']._targetCounter++;
						if (c.memory['PATROL']._targetCounter >= c.memory['PATROL'].targetFlags.length) {
							c.memory['PATROL']._targetCounter = 0;
						}
					})
				},
				WITHDRAW: {
					stores: [CONTAINER, STORAGE]
				},
				PATROL: {
					targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
				}
			});
		}
	}

	//spawn harvesters (enough to support the guards)
	if (!tags.harvester || tags.harvester < 4) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, DEPOSIT, HARVEST], specializedHarvesterBody, {
			DEPOSIT: {
				stores: [CONTAINER]
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
				stores: [CONTAINER, STORAGE]
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
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, DEPOSIT, HARVEST], specializedHarvesterBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			DEPOSIT: {
				stores: [CONTAINER]
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 5) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [CRY, FEAR, PICKUP, WITHDRAW, HARVEST, UPGRADE], largeWorkerBody, {
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
		return spawnCreep(spawn, "builder", ["builder"], [CRY, FEAR, REPAIR, BUILD, WITHDRAW, PATROL], largeWorkerBody, {
			FEAR: {
				onSafe: serialize(c => {
					c.memory['PATROL']._targetCounter++;
					if (c.memory['PATROL']._targetCounter >= c.memory['PATROL'].targetFlags.length) {
						c.memory['PATROL']._targetCounter = 0;
					}
				})
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			},
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}
}

module.exports = run;
