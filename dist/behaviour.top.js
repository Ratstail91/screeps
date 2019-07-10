const _ = require('lodash');

const { TOP: BEHAVIOUR_NAME, UPGRADE, BUILD } = require('behaviour_names');

const upgrade = require('behaviour.upgrade');
const build = require('behaviour.build');

function run(creep) {
	if (creep.memory[UPGRADE] && creep.memory[UPGRADE].lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[UPGRADE].lock = false;

		if (_.sum(creep.carry) != 0) {
			return upgrade(creep);
		}
	}

	if (creep.memory[BUILD] && creep.memory[BUILD].lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[BUILD].lock = false;

		if (_.sum(creep.carry) != 0) {
			return build(creep);
		}
	}

	//no-op
	return true;
}

module.exports = run;
