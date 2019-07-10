const _ = require('lodash');

const { TOP: BEHAVIOUR_NAME, UPGRADE } = require('behaviour_names');

const upgrade = require('behaviour.upgrade');

function run(creep) {
	if (creep.memory[UPGRADE] && creep.memory[UPGRADE].lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[UPGRADE].lock = false;

		if (_.sum(creep.carry) != 0) {
			return upgrade(creep);
		}
	}

	//no-op
	return true;
}

module.exports = run;
