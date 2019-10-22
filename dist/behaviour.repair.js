/* DOCS: repair behaviour
 * This behaviour makes creeps repair any partially damaged buildings in the same room.
 * The options are visibile in init(creep).
 * This behaviour interacts with TOP.
 * Note that ramparts and walls are ignored by default.
*/
const { REPAIR: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

/* DOCS: init(creep)
 * Initialize repair behaviour for "creep".
*/
function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		structures: null, //only repair these structure types
		threshold: 0.6, //amount of health at which repairs are needed
		rampartHealth: 0, //repair ramparts to this point
		wallHealth: 0, //repair walls to this point
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

/* DOCS: run(creep)
 * Run repair behaviour for "creep".
 * "top" is only set by the behaviour TOP
*/
function run(creep, top = false) {
	//can't repair on an empty stomach
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		return true;
	}

	//don't stand on the doorway!
	if (creep.pos.x <= 0 || creep.pos.y <= 0 || creep.pos.x >= 49 || creep.pos.y >= 49) {
		return true;
	}

	//find the closest repair target
	let repairTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, {
		filter: target => {
			//exclude non-specified structure types
			if (creep.memory[BEHAVIOUR_NAME].structures && creep.memory[BEHAVIOUR_NAME].structures.indexOf(target.structureType) == -1) {
				return false;
			}

			//handle walls and ramparts separately
			if (target.structureType == STRUCTURE_WALL) {
				return target.hits < creep.memory[BEHAVIOUR_NAME].wallHealth;
			}

			if (target.structureType == STRUCTURE_RAMPART) {
				return target.hits < (top ? creep.memory[BEHAVIOUR_NAME].rampartHealth : creep.memory[BEHAVIOUR_NAME].rampartHealth * creep.memory[BEHAVIOUR_NAME].threshold);
			}

			//default: use general threshold
			return target.hits < (top ? target.hitsMax : target.hitsMax * creep.memory[BEHAVIOUR_NAME].threshold);
		},
		range: 3
	});

	//if no repair targets
	if (!repairTarget) {
		return true;
	}

	const repairResult = creep.repair(repairTarget);

	switch(repairResult) {
		case OK:
			//everything is OK, send a '_lock' message to TOP
			creep.memory[BEHAVIOUR_NAME]._lock = true;
			return false;

		case ERR_NOT_IN_RANGE:
			creep.moveTo(repairTarget, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle, range: 3 });
			return false;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: repairResult ${repairResult}`);
	}
}

module.exports = {
	init: init,
	run: run
};