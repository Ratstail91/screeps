const moduleNames = require('module_names');

function handleModules(creep, moduleName) {
	//check for valid module name
	if (Object.keys(moduleNames).indexOf(moduleName) == -1) {
		throw new Error(`Unknown module ${moduleName}`);
	}

	//require() caches the modules automatically, and throws an error on file-not-found
	const mod = require(`module.${moduleNames[moduleName].toLowerCase()}`);

	//pass the creep to the module for processing
	if (typeof(mod) === 'function') {
		return mod(creep);
	} else {
		return mod.run(creep);
	}
}

module.exports = handleModules;
