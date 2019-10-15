const { initializeBehaviours, handleBehaviour } = require('behaviours');

//special cases
const top = require('behaviour.top');
const bottom = require('behaviour.bottom');

/* spawnCreep(spawn, name, behaviours, body[, memory])
 * This spawns a new creep at "spawn", setting that spawn as it's origin
 * This takes a "name" and appends the time of creation so that the name is unique
 * This takes an array of "tags" which are used by the spawn logic
 * This takes an array of "behaviours" and "bodyParts"
 * This takes an optional object "memory", appends behaviours and origin spawn name to it, sets that as the creep's memory
*/
function spawnCreep(spawn, name, tags, behaviours, bodyParts, memory = {}) {
	//TODO: add verification, part matching between behaviours and bodyParts
	return spawn.spawnCreep(bodyParts, name + Game.time, {
		memory: _.merge(memory, {
			tags: tags,
			behaviours: behaviours,
			origin: spawn.name, //TODO: surrogate mother spawns
		})
	});
}

/* DOCS: handleCreep(creep)
 * runs the behaviour stack AI for "creep"
*/
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
		if (!handleBehaviour(creep, creep.memory.behaviours[index])) {
			break;
		}
	}

	bottom(creep);
}

module.exports = {
	spawnCreep,
	handleCreep
};