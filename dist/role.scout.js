const { roleLength, excludeUnreachable } = require('utils');

const ROLE_NAME = 'scout';

function spawn(origin, max, roleName, type = 'medium') {
	if (roleLength(Game.creeps, roleName, origin) >= max) {
		return;
	}

	//determine the size to use
	let body;
	switch(type) {
		case 'medium':
			//500
			body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH];
			break;

		case 'large':
			body = [
				//1280 total
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				MOVE, TOUGH, //60
				ATTACK, MOVE, //130
				ATTACK, MOVE, //130
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
		creep.moveTo(Game.flags['rallypointoverride'], { visualizePathStyle: {}});
		return;
	}

	//exclude unreachable items from targets (cached because CPU)
	const isObject = (a) => (!!a) && (a.constructor === Object);
	if (!isObject(creep.memory.exclude)) {
		creep.memory.exclude = {};
	}

	let targets = findHostileTargets(creep);

	targets = targets.filter(target => !creep.memory.exclude[target.id]);

	if (targets.length == 0 || (creep.room.controller && creep.room.controller.safeMode)) {
		if (Game.flags['rallypoint']) {
			creep.moveTo(Game.flags['rallypoint'], { visualizePathStyle: {}});
		} else {
			creep.moveTo(Game.flags['home'], { visualizePathStyle: {}});
		}
	} else {
		targets = excludeUnreachable(creep, targets);

		//move to the target, or exclude it
		const moveResult = creep.moveTo(targets[0], { visualizePathStyle: {stroke: '#ff0000'}});

		if (moveResult != OK && moveResult != ERR_TIRED) {
			throw new Error(`Unknown moveResult: ${moveResult}`);
		}
	}
}

function findHostileTargets(creep) {
	const towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
	const creeps = creep.room.find(FIND_HOSTILE_CREEPS);
	const structures = creep.room.find(FIND_HOSTILE_STRUCTURES , {filter: (structure) => structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_STORAGE });
	const spawns = creep.room.find(FIND_HOSTILE_SPAWNS);

	return [...towers, ...spawns, ...structures, ...creeps];
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max, type) => spawn(origin, max, ROLE_NAME, type),
	run: run
};