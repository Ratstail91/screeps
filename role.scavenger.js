const { roleLength, getStores, excludeUnreachable } = require('utils');

const ROLE_NAME = 'scavenger';

function spawn(origin, max, roleName, type = 'small') {
	if (roleLength(Game.creeps, roleName, origin) >= max) {
		return;
	}

	//determine the size to use
	let body;
	switch(type) {
		case 'small':
			//500
			body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY];
			break;

		case 'truck':
			body = [
				//1300 total
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
			];
			break;

		default:
			throw new Error(`Unknown spawn type ${type}`);
	}

	return Game.spawns[origin].spawnCreep(
		body,
		roleName + Game.time,
		{ memory: { role: roleName, origin: origin }}
	);
}

function run(creep) {
	if (Game.flags['rallypointoverride']) {
		creep.moveTo(Game.flags['rallypointoverride'], { reusePath: 10, visualizePathStyle: {}});
		return;
	}
	
	//exclude unreachable items from targets (cached because CPU)
	const isObject = (a) => (!!a) && (a.constructor === Object);
	if (!isObject(creep.memory.exclude)) {
		creep.memory.exclude = {};
	}

	//targets
	let energy = creep.room.find(FIND_DROPPED_RESOURCES);
	let tombstones = creep.room.find(FIND_TOMBSTONES, { filter: tombstone => tombstone.store[RESOURCE_ENERGY] > 0 });
	let containers = creep.room.find(FIND_STRUCTURES, { filter: container => container.structureType == STRUCTURE_CONTAINER && container.store[RESOURCE_ENERGY] > 0 });
	let storage = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0 });

	//filter out what is already unreachable
	energy = energy.filter(target => !creep.memory.exclude[target.id]);
	tombstones = tombstones.filter(target => !creep.memory.exclude[target.id]);
	containers = containers.filter(target => !creep.memory.exclude[target.id]);
	storage = storage.filter(target => !creep.memory.exclude[target.id]);

	//working?
	creep.memory.working = (storage.length > 0 || containers.length > 0 || tombstones.length > 0 || energy.length > 0) && creep.carry.energy != creep.carryCapacity;

	if(creep.memory.working) {
		energy = excludeUnreachable(creep, energy);
		tombstones = excludeUnreachable(creep, tombstones);
		containers = excludeUnreachable(creep, containers);
		storage = excludeUnreachable(creep, storage);

		if(energy.length && creep.pickup(energy[0]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(energy[0], { reusePath: 10, visualizePathStyle: {}});
		} else if (tombstones.length && creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(tombstones[0], { reusePath: 10, visualizePathStyle: {}});
		} else if (containers.length && creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(containers[0], { reusePath: 10, visualizePathStyle: {}});
		} else if (storage.length && creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(storage[0], { reusePath: 10, visualizePathStyle: {}});
		}
	}
	else {
		return notWorking(creep);
	}
}

function notWorking(creep) {
	//full belly, not home, scurry home
	if (creep.carry.energy == creep.carryCapacity && creep.room.find(FIND_FLAGS, { filter: flag => flag.name == 'home'}).length == 0) {
		creep.moveTo(Game.flags['home'], { reusePath: 10, visualizePathStyle: {}});
		return;
	}

	//get the stores
	const stores = getStores(creep);

	const transferResult = creep.transfer(stores[0], RESOURCE_ENERGY);

	if(transferResult == ERR_NOT_IN_RANGE && creep.carry.energy != 0) {
		creep.moveTo(stores[0], { reusePath: 10, visualizePathStyle: {}});
		return;
	}

	//no stores, empty belly, go rally (or go home)
	if (stores.length == 0 || transferResult == ERR_INVALID_TARGET || creep.carry.energy == 0) {
		if (Game.flags['collectionpoint']) {
			if (creep.moveTo(Game.flags['collectionpoint'], { reusePath: 10, visualizePathStyle: {}}) == ERR_NO_PATH) {
				creep.moveTo(Game.flags['home'], { reusePath: 10, visualizePathStyle: {}});
			}
		} else if (Game.flags['rallypoint']) {
			if (creep.moveTo(Game.flags['rallypoint'], { reusePath: 10, visualizePathStyle: {}}) == ERR_NO_PATH) {
				creep.moveTo(Game.flags['home'], { reusePath: 10, visualizePathStyle: {}});
			}
		} else {
			creep.moveTo(Game.flags['home'], { reusePath: 10, visualizePathStyle: {}});
		}
		return;
	}
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max, type) => spawn(origin, max, ROLE_NAME, type),
	run: run
};