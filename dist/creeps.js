const handleBehaviours = require('behaviours');

const top = require('behaviour.top');
const bottom = require('behaviour.bottom');

//for updating existing creeps
function updateCreep(creep) {
	switch(creep.memory.role) {
		//domestics
		case 'harvester':
		case 'builder':
		case 'repairer':
			creep.memory.behaviours = ['HARVEST', 'STORE', 'UPGRADE'];
			creep.memory.role = null;
			break;

		case 'upgrader':
			creep.memory.behaviours = ['HARVEST', 'UPGRADE'];
			creep.memory.role = null;
			break;

		//ignore (too niche to be worth upgrading)
		case 'scout':
		case 'scavenger':
		case 'signwriter':
		case 'claimer':
		case 'storemanager':
		default:
			break;
	}
}

function handleCreep(creep) {
	//not ready yet
	if (creep.spawning) {
		return;
	}

	//compatability (remove this)
	updateCreep(creep);

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
