const { REPAIR: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//NOTE: building ramparts last, skipping walls
	let repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
		filter: (target) => target.hits < target.hitsMax && target.structureType != STRUCTURE_WALL && target.structureType != STRUCTURE_RAMPART
	});

	if (!repairTarget) {
		//NOTE: only rep ramparts to 10k (for now)
		let repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: (target) => target.hits < 10000 && target.structureType == STRUCTURE_RAMPART
		});
	}

	if (!repairTarget) {
		return true;
	}

	const repairResult = creep.repair(repairTarget);

	if (repairResult == OK) {
		//DO NOTHING
		return false;
	} else if (repairResult == ERR_NOT_IN_RANGE) {
		//TODO: move to closest?
		creep.moveTo(allSites[0], { reusePath: REUSE_PATH, visalizePathStyle: pathStyle });
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: repairResult ${repairResult}`);
}

module.exports = run;
