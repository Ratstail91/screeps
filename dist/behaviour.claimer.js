const { CLAIMER: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		claim: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	let claimResult;

	if (creep.memory[BEHAVIOUR_NAME].claim) {
		claimResult = creep.claimController(creep.room.controller);
	} else {
		claimResult = creep.reserveController(creep.room.controller);
	}

	switch(claimResult) {
		case OK:
			//DO NOTHING
			return false;

		case ERR_NOT_IN_RANGE:
			creep.moveTo(creep.room.controller, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle});
			return false;

		case ERR_GCL_NOT_ENOUGH:
			creep.reserveController(creep.room.controller);
			return false;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: claimResult ${claimResult}`);
	}
}

module.exports = {
	init: init,
	run: run
};
