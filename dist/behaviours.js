const behaviourNames = require('behaviour_names');

/* initializeBehaviours(creep)
 * reads through a list of the creep's behaviours, loads that behaviour, and initializes the "creep" with it if an init function is present
*/
function initializeBehaviours(creep) {
	//don't double-init
	if (creep.memory._init) {
		return;
	}

	creep.memory._init = true;

	for (const name in creep.memory.behaviours) {
		//require() caches the behaviours automatically, and throws an error on file-not-found
		const behaviour = require(`behaviour.${creep.memory.behaviours[name].toLowerCase()}`);

		//if the behaviour is an object, it has an init function
		if (typeof(behaviour) === 'function') {
			//DO NOTHING
		} else {
			behaviour.init(creep);
		}
	}
}

function handleBehaviour(creep, name) {
	//check for valid behaviour name
	if (!behaviourNames[name]) {
		throw new Error(`Unknown behaviour ${name}`);
	}

	//require() caches the behaviours automatically, and throws an error on file-not-found
	const behaviour = require(`behaviour.${behaviourNames[name].toLowerCase()}`);

	//pass the creep to the behaviour for processing
	if (typeof(behaviour) === 'function') {
		return behaviour(creep);
	} else {
		return behaviour.run(creep);
	}
}

const profiler = require('screepers.profiler');

module.exports = {
	initializeBehaviours: profiler.registerFN(initializeBehaviours, "behaviours.initializeBehaviours"),
	handleBehaviour: profiler.registerFN(handleBehaviour, "behaviours.handleBehaviour"),
};