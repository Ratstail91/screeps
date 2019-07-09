const behaviourNames = require('behaviour_names');

function handleBehaviours(creep, name) {
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

module.exports = handleBehaviours;
