const handleBehaviours = require('behaviours');

const top = require('behaviour.top');
const bottom = require('behaviour.bottom');

function handleCreep(creep) {
	//not ready yet
	if (creep.spawning) {
		return;
	}

	//TOP and BOTTOM are pulled out so they run correctly regardless of stack states
	if (!top(creep)) {
		return;
	}

	//if a module returns false, break the loop
	for (const index in creep.memory.behaviours) {
		if (!handleBehaviours(creep, creep.memory.behaviours[index])) {
			break;
		}
	}

	bottom(creep);
}

module.exports = handleCreep;
