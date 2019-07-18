const { REPAIR: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//can't repair on an empty stomach
	if (_.sum(creep.carry) == 0) {
		return true;
	}

	//don't stand on the doorway!
	if (creep.pos.x <= 0 || creep.pos.y <= 0 || creep.pos.x >= 49 || creep.pos.y >= 49) {
		return true;
	}

	//NOTE: building ramparts last, skipping walls
	let repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
		filter: (target) => target.hits < target.hitsMax && target.structureType != STRUCTURE_WALL && target.structureType != STRUCTURE_RAMPART
	});

	if (!repairTarget) {
		//NOTE: only rep ramparts to 10k (for now)
		repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: (target) => target.hits < 10 * 1000 && target.structureType == STRUCTURE_RAMPART
		});
	}

	//if no repair targets
	if (!repairTarget) {
		return true;
	}

	const repairResult = creep.repair(repairTarget);

	if (repairResult == OK) {
		//everything is OK, send a '_lock' message to TOP
		creep.memory[BEHAVIOUR_NAME]._lock = true;
		return false;
	} else if (repairResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(repairTarget, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: repairResult ${repairResult}`);
}

module.exports = {
	init: init,
	run: run
};
