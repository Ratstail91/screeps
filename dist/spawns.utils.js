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

/* DOCS: initializeSpawnMemory(spawn)
 * Initializes the memory of "spawn"
*/
function initializeSpawnMemory(spawn) {
	console.log("initializeSpawnMemory");
	//create the data structures
	if (!Memory.spawns) {
		Memory.spawns = {};
	}

	if (!Memory.spawns[spawn.name]) {
		Memory.spawns[spawn.name] = {};
	}

	//initialize remotes
	Memory.spawns[spawn.name].remotes = {};

	//initial remote: this room
	Memory.spawns[spawn.name].remotes[`${spawn.name}remote0`] = new RoomPosition(1, 1, spawn.room.name);

	//expand the remotes
	expandRemotes(spawn);

	//TODO: more
}

/* DOCS: expandRemotes(spawn)
 * Expands the remotes of "spawn" out by one layer
*/
function expandRemotes(spawn) {
	Object.values(Memory.spawns[spawn.name].remotes).forEach(remote => {
		const mappedRoom = Memory.map.rooms[remote.roomName];
		Object.values(mappedRoom.exits).forEach(roomName => createRemoteIfNotExists(spawn, roomName));
	});
}

/* DOCS: createRemoteIfNotExists(spawn, roomName)
 * Creates a remote for "spawn" in "rooomName" if it doesn't already exist
*/
function createRemoteIfNotExists(spawn, roomName) {
	let remoteCount = Object.keys(Memory.spawns[spawn.name].remotes).length;
	let existingRemotes = Object.values(Memory.spawns[spawn.name].remotes).filter(r => r.roomName == roomName);

	if (existingRemotes.length == 0) {
		Memory.spawns[spawn.name].remotes[`${spawn.name}remote${remoteCount}`] = new RoomPosition(1, 1, roomName);
	}
}

/* DOCS: countRemotes(spawnName)
 * Counts every remote of spawnName
*/
function countRemotes(spawnName) {
	return Object.keys(Memory.spawns[spawnName].remotes).length;
}

module.exports = {
	getCreepsByOrigin,
	getPopulationByTags,
	initializeSpawnMemory,
	expandRemotes,
	createRemoteIfNotExists,
	countRemotes,
};