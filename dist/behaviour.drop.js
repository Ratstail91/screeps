const { DROP: BEHAVIOUR_NAME } = require('behaviour_names');

function run(creep) {
	if (creep.store[RESOURCE_ENERGY] != 0) {
		creep.drop(RESOURCE_ENERGY);
		return false;
	}
	return true;
}

module.exports = run;
