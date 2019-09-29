/* DOCS: stage 4
 * The main priority at this stage is to grow, map out the surrounding rooms, and place remotes.
*/

const { STAGE_4_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags, initializeSpawnMemory } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, HARVEST, UPGRADE, BUILD, REPAIR,
	RECORD, EXPLORE, WANDER,
} = require("behaviour_names");

const { schematicBuild } = require("schematic");

//assume 1300 is available
const specializedHarvesterBody = [ //800
	//50 * 5 = 250
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 1 = 50
	CARRY,

	//100 * 5 = 500
	WORK, WORK, WORK, WORK, WORK,
];

function run(spawn) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	if (!Memory.spawns || !Memory.spawns[spawn.name]) {
		initializeSpawnMemory(spawn);
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], specializedHarvesterBody);
	}
}

module.exports = run;
