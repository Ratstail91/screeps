const { UPGRADE: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//if can't upgrade this controller, go home
	if (!creep.room.controller || !creep.room.controller.my) {
		const originSpawns = creep.room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_SPAWN && structure.name == creep.memory.origin });
		if (originSpawns.length == 0) {
			creep.moveTo(Game.spawns[creep.memory.origin], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;
		}
	}

	const upgradeResult = creep.upgradeController(creep.room.controller);

	if (upgradeResult == OK) {
		//everything is OK, send a '_lock' message to TOP
		creep.memory[BEHAVIOUR_NAME]._lock = true;
		return false;
	} else if (upgradeResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: upgradeResult ${upgradeResult}`);
}

module.exports = {
	init: init,
	run: run
};
