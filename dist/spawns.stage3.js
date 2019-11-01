/* DOCS: stage 3
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_3_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
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
const { serialize } = require("behaviour.bespoke");

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

const tankBody = [ //700
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //50

	MOVE, MOVE, MOVE, MOVE, MOVE, //250

	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, //400
];

const healerBody = [ //600
	MOVE, MOVE, //100

	HEAL, HEAL, //500
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
				HARVEST: {
					skipOnFull: true,
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
				onSafe: serialize(c => {
					if (!c.memory['HARVEST'].lockToSource) {
						c.memory['HARVEST'].remote = null;
						c.memory['HARVEST'].source = null;
					}
				})
			}
		});
	}

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

	//guards when someone cries for help
	if ((!tags.guard || tags.guard < 1) && Memory._cries.length > 0) { //TODO: origin-based cries
		return spawnCreep(spawn, "guard", ["guard"], [CARE, BRAVE, PATROL], tankBody, {
			PATROL: {
				targetFlags: Object.keys(Memory.spawns[spawn.name].remotes)
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

	//spawn MORE harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [CRY, FEAR, PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => {
					if (!c.memory['HARVEST'].lockToSource) {
						c.memory['HARVEST'].remote = null;
						c.memory['HARVEST'].source = null;
					}
				})
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 2) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [CRY, FEAR, PICKUP, HARVEST, UPGRADE], mediumBody, {
			FEAR: {
				onSafe: serialize(c => { c.memory['HARVEST'].remote = null; c.memory['HARVEST'].source = null; })
			},
			HARVEST: {
				skipOnFull: true,
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

module.exports = profiler.registerFN(run, "spawns.stage3");
