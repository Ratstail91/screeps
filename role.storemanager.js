const { roleLength } = require('utils');

const ROLE_NAME = 'storemanager';

function spawn(origin, max, roleName) {
	if (roleLength(Game.creeps, roleName, origin) >= max) {
		return;
	}

	//determine the size to use
	let body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];

	return Game.spawns[origin].spawnCreep(
		body,
		roleName + Game.time,
		{ memory: { role: roleName, working: false, origin: origin }}
	);
}

function run(creep) {
	//working?
	if (creep.memory.working && creep.carry.energy == 0) {
		creep.memory.working = false;
	} else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
		creep.memory.working = true;
	}

	if (creep.memory.working) {
		const destinations = getDestinations(creep);

		//nothing to do
		if (destinations.length == 0) {
			creep.memory.working = false;
			return notWorking(creep);
		}

		if (creep.transfer(destinations[destinations.length - 1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(destinations[destinations.length - 1], {reusePath: 10});
		}
	} else {
		return notWorking(creep);
	}
}

function notWorking(creep) {
	const sources = getSources(creep);

	//nothing to do
	if (sources.length == 0) {
		if (creep.carry.energy > 0) {
			creep.memory.working = true;
		}
		return;
	}

	if (creep.pickup(sources[0]) == ERR_NOT_IN_RANGE || creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		creep.moveTo(sources[0], {reusePath: 10});
	}
}

function getSources(creep) {
	const energy = creep.room.find(FIND_DROPPED_RESOURCES);

	const tombstones = creep.room.find(FIND_TOMBSTONES, { filter: tombstone => {
		return tombstone.store[RESOURCE_ENERGY] > 0
	}});

	const containers = creep.room.find(FIND_STRUCTURES, { filter: structure => {
		return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0
	}});

	const storage = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
	});

	return [...energy, ...tombstones, ...containers, ...storage];
}

function getDestinations(creep) {
	return creep.room.find(FIND_STRUCTURES, { filter: structure => {
		return (structure.structureType == STRUCTURE_SPAWN ||
			structure.structureType == STRUCTURE_EXTENSION ||
			structure.structureType == STRUCTURE_TOWER) &&
			structure.energy < structure.energyCapacity
		;
	}});
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max) => spawn(origin, max, ROLE_NAME),
	run: run
};