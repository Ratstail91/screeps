const { CRY: BEHAVIOUR_NAME } = require('behaviour_names');

const { createCry } = require('utils.cry');

function run(creep) {
	//if hostiles found
	const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

	if (hostiles.length > 0) {
		createCry(creep.room.name);
	}

	return true;
}

module.exports = run;
