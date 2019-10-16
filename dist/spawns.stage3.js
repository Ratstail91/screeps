/* DOCS: stage 3
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_3_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, WITHDRAW, HARVEST, UPGRADE, BUILD, REPAIR,
} = require("behaviour_names");

const {
	TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE,
} = require("store.utils");

const { schematicBuild } = require("schematic");

//assume 800 is available - medium body is 800e
const mediumBody = [ //800
	CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK,
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
];

const lorryBody = [ //800
	CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
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

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 4) {
		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 4) {
			return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], mediumBody, {
				HARVEST: {
					remote: 0,
					source: null
				}
			});
		}
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 5) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [PICKUP, HARVEST, UPGRADE], mediumBody);
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 2) {
		return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], mediumBody);
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
}

module.exports = run;
