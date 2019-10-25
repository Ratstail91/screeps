const { DROP: BEHAVIOUR_NAME } = require('behaviour_names');

function run(creep) {
	if (creep.store[RESOURCE_ENERGY] != 0) {
		creep.drop(RESOURCE_ENERGY);
		return false;
	}
	return true;
}

const profiler = require('screepers.profiler');

module.exports = profiler.registerFN(run, "drop.run");
