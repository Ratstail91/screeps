const { initializeBehaviours, handleBehaviours } = require('behaviours');

const top = require('behaviour.top');
const bottom = require('behaviour.bottom');

function spawnCreep(spawn, name, behaviours, body, tags, memory = {}) {
	//TODO: add verification, part matching between behaviours and body
	return spawn.spawnCreep(body, name + Game.time, { memory: _.merge(memory, {
		behaviours: behaviours,
		origin: spawn.name,
		tags: tags //used in spawn logic
	})});
}

function handleCreep(creep) {
	//not ready yet
	if (creep.spawning) {
		initializeBehaviours(creep);
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

module.exports = {
	spawnCreep,
	handleCreep
};
