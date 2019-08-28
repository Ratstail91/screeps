/* DOCS: wander behaviour
 * Wander in random directions.
*/

const { WANDER: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_targetPos: null,
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//find a random room to wander to
	if (creep.memory[BEHAVIOUR_NAME]._targetPos == null || creep.memory[BEHAVIOUR_NAME]._targetPos.roomName != creep.room.name) {
		const exits = creep.room.find(FIND_EXIT);

		creep.memory[BEHAVIOUR_NAME]._targetPos = exits[Math.floor(Math.random() * exits.length)];
	}

	//move towards the target
	creep.moveTo(creep.memory[BEHAVIOUR_NAME]._targetPos.x, creep.memory[BEHAVIOUR_NAME]._targetPos.y, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

	return false;
}

module.exports = {
	init,
	run,
};
