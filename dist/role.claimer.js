const { roleLength } = require('utils');

const ROLE_NAME = 'claimer';

function spawn(origin, max, roleName) {
	if (roleLength(Game.creeps, roleName, origin) >= max) {
		return;
	}

	//determine the size to use
	let body = [MOVE, CLAIM];

	return Game.spawns[origin].spawnCreep(
		body,
		roleName + Game.time,
		{ memory: { role: roleName, origin }}
	);
}

function run(creep) {
	const flags = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == 'claimme' });

	if (flags.length > 0) {
		if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller, { reusePath: 10, visualizePathStyle: { stroke: '#00ff00' }});
		}
	} else {
		creep.moveTo(Game.flags['claimme'], { reusePath: 10, visualizePathStyle: { stroke: '#00ff00' }});
	}
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max) => spawn(origin, max, ROLE_NAME),
	run: run
};