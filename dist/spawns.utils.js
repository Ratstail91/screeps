/* DOCS: getCreepsByOrigin(spawn)
 * Find all creeps from "spawn".
*/
function getCreepsByOrigin(spawn) {
	const creeps = Object.values(Game.creeps)
		.filter(creep => creep.memory.origin == spawn.name)
	;

	return creeps;
}

/* DOCS: getPopulationByTags([creeps])
 * Count each instance of each tag in the array "creeps".
 * If "creeps" is not provided, it uses Game.creeps.
*/
function getPopulationByTags(creeps = Game.creeps) {
	//known tags
	const population = {};

	//count all arbitrary tags (store them in population, defined above)
	Object.values(creeps)
		.map(creep => creep.memory.tags)
		.forEach(tags => {
			tags.forEach(tag => population[tag] = population[tag] + 1 || 1)
		})
	;

	return population;
}

/* DOCS: countRemotes(spawnName)
 * Counts every remote of spawnName
 * TODO: improve efficiency
*/
function countRemotes(spawnName) {
	let counter = 0;

	//clear the existing flags
	Memory.spawns[spawnName].remotes = {};

	while(true) {
		let flagName = `${spawnName}remote${counter}`;

		if (!Game.flags[flagName]) {
			break;
		}

		registerRemote(spawnName, flagName);

		counter++;
	}

	return Memory.spawns[spawnName] ? Object.keys(Memory.spawns[spawnName].remotes).length : 0;
}

function registerRemote(spawnName, flagName) {
	if (Memory.spawns[spawnName]) {
		Memory.spawns[spawnName].remotes[flagName] = Game.flags[flagName].pos;
	}
}

/* DOCS: initializeSpawnMemory(spawn)
 * Initializes the memory of "spawn"
*/
function initializeSpawnMemory(spawn) {
	//create the data structures
	if (!Memory.spawns) {
		Memory.spawns = {};
	}

	if (!Memory.spawns[spawn.name]) {
		Memory.spawns[spawn.name] = {};
	}

	//initialize remotes
	Memory.spawns[spawn.name].remotes = {};

	//TODO: more
	//TODO: record each newly registered remote
}

module.exports = {
	getCreepsByOrigin,
	getPopulationByTags,
	countRemotes,
	registerRemote,
	initializeSpawnMemory,
};