const { CLAIMER: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		claim: false
	}, creep.memory[BEHAVIOUR_NAME]);

	console.log('initialized claimer creep')
}

function run(creep) {
	let claimResult;

	if (creep.memory[BEHAVIOUR_NAME].claim) {
		claimResult = creep.claimController(creep.room.controller);
	} else {
		claimResult = creep.reserveController(creep.room.controller);
	}

	if (claimResult == OK) {
		//DO NOTHING
		return false;
	} else if (claimResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle});
		return false;
	} else if (claimResult == ERR_GCL_NOT_ENOUGH) {
		creep.reserveController(creep.room.controller);
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: claimResult ${claimResult}`);
}

module.exports = {
	init: init,
	run: run
};
