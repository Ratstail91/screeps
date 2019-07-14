const { REPAIR: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//initialize new creeps
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_lock: false,
		_wasLocked: false
	}, creep.memory[BEHAVIOUR_NAME]);

	//using _wasLocked to reduce the target number by 40% when not currently repairing it
	wasLocked = creep.memory[BEHAVIOUR_NAME]._wasLocked;
	creep.memory[BEHAVIOUR_NAME]._wasLocked = false;

	//can't repair on an empty stomach
	if (_.sum(creep.carry) == 0) {
		return true;
	}

	//NOTE: building ramparts last, skipping walls
	let repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
		filter: (target) => target.hits < (wasLocked ? target.hitsMax : target.hitsMax *.6) && target.structureType != STRUCTURE_WALL && target.structureType != STRUCTURE_RAMPART
	});

	if (!repairTarget) {
		//NOTE: only rep ramparts to 10k (for now)
		repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: (target) => target.hits < (wasLocked ? 10000 : 6000) && target.structureType == STRUCTURE_RAMPART
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
		creep.memory[BEHAVIOUR_NAME]._wasLocked = true;
		return false;
	} else if (repairResult == ERR_NOT_IN_RANGE) {
		//TODO: move to closest?
		creep.moveTo(repairTarget, { reusePath: REUSE_PATH, visalizePathStyle: pathStyle });
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: repairResult ${repairResult}`);
}

module.exports = run;
