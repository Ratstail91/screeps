/* DOCS: stage 4
 * The main priority at this stage is to grow, map out the surrounding rooms, and place remotes.
*/

const { STAGE_4_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags, initializeSpawnMemory } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DROP, DEPOSIT, WITHDRAW,
	HARVEST, UPGRADE, BUILD, REPAIR,
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

function run(spawn) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	if (!Memory.spawns || !Memory.spawns[spawn.name]) {
		initializeSpawnMemory(spawn);
	}

//	buildRemoteContainers(spawn);

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 10) {
		return spawnCreep(spawn, "harvester", ["harvester"], [DROP, HARVEST], specializedHarvesterBody);
	}

	//spawn restocker
	if (!tags.restocker || tags.restocker < 1) {
		return spawnCreep(spawn, "restocker", ["restocker"], [DEPOSIT, WITHDRAW], specializedLorryBody);
	}
}

function buildRemoteContainers(spawn) {
	Object.keys(Memory.spawns[spawn.name].remotes)
		.forEach(remoteName => {
			//skip invisible rooms for now
			if (!Game.rooms[Memory.spawns[spawn.name].remotes[remoteName].roomName]) {
				return;
			}

			//create the container array
			if (!Memory.spawns[spawn.name].remotes[remoteName].containers) {
				Memory.spawns[spawn.name].remotes[remoteName].containers = [];
			}

			//prune destroyed containers
			Memory.spawns[spawn.name].remotes[remoteName].containers = Memory.spawns[spawn.name].remotes[remoteName].containers.filter(c => c);

			//skip rooms that already have containers built
			if (Memory.spawns[spawn.name].remotes[remoteName].containers.length == Memory.map.rooms[Memory.spawns[spawn.name].remotes[remoteName].roomName].sources) {
				return;
			}

			//TODO: place the container next to the sources...
		});
}

module.exports = run;
