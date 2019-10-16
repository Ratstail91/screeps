/* DOCS: stage 4
 * This stage switches to using canister mining.
 * This relies on existing infrastructure placed by the player.
*/

const { STAGE_4_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, WITHDRAW, HARVEST, UPGRADE, BUILD, REPAIR,
	TARGET, PATROL, BRAVE,
} = require("behaviour_names");

const {
	TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE,
} = require("store.utils");

const { schematicBuild } = require("schematic");

//assume 1300 is available
const claimerBody = [ //650
	MOVE, CLAIM,
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
	if (!tags.claimer1 || tags.claimer1 < 1) {
		return spawnCreep(spawn, "claimer", ["claimer1"], [CLAIMER, TARGET], claimerBody, {
			TARGET: {
				targetFlag: "reserveme1"
			}
		});
	}

	if (!tags.claimer2 || tags.claimer2 < 1) {
		return spawnCreep(spawn, "claimer", ["claimer2"], [CLAIMER, TARGET], claimerBody, {
			TARGET: {
				targetFlag: "reserveme2"
			}
		});
	}

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 5) {
		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 6) {
			return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, WITHDRAW, PATROL], largeWorkerBody, {
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
		return spawnCreep(spawn, "harvester", ["harvester"], [DEPOSIT, HARVEST], specializedHarvesterBody, {
			DEPOSIT: {
				stores: [CONTAINER]
			}
		});
	}

	if (tags.guard || tags.guard < 2) {
		return spawnCreep(spawn, "guard", ["guard"], [BRAVE, PATROL], guardBody, {
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	//spawn MORE harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [DEPOSIT, HARVEST], specializedHarvesterBody, {
			DEPOSIT: {
				stores: [CONTAINER]
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 5) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [PICKUP, WITHDRAW, HARVEST, UPGRADE], largeWorkerBody, {
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			}
		});
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 2) {
		return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, WITHDRAW, PATROL], largeWorkerBody, {
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			},
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
			}
		});
	}

	//lorry
	if (!tags.lorry || tags.lorry < 1) {
		return spawnCreep(spawn, "lorry", ["lorry"], [DEPOSIT, WITHDRAW, PATROL], lorryBody, {
			DEPOSIT: {
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
}

module.exports = run;
