const { roleLength } = require('utils');

const ROLE_NAME = 'signwriter';

const SIGN_TEXT = 'I am the greatest programmer here!';

function spawn(origin, max, roleName) {
	if (roleLength(Game.creeps, roleName, origin) >= max) {
		return;
	}

	//determine the size to use
	let body = [MOVE, MOVE, MOVE, MOVE];

	return Game.spawns[origin].spawnCreep(
		body,
		roleName + Game.time,
		{ memory: { role: roleName, origin: origin }}
	);
}

function run(creep) {
	if (creep.room.controller && creep.room.controller.sign && creep.room.controller.sign.text != SIGN_TEXT) {
		if (creep.signController(creep.room.controller, SIGN_TEXT) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller.pos, { reusePath: 10, visualizePathStyle: { stroke: '#0000ff' }});
		}
	} else {
		creep.moveTo(Game.flags['signme'], { reusePath: 10, visualizePathStyle: { stroke: '#0000ff' }});
	}
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max) => spawn(origin, max, ROLE_NAME),
	run: run
};