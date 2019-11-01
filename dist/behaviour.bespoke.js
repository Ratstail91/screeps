/* DOCS: bespoke behaviour
 * This behaviour is for modifying the creep at runtime.
*/

const { BESPOKE: BEHAVIOUR_NAME } = require('behaviour_names');

function serialize(func) {
	return func.toString().replace(/[\t\n\r]/g, '');
}

function deserialize(str) {
	return new Function('return ' + str)();
}

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		onTick: 'c => null',
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	return deserialize(creep.memory[BEHAVIOUR_NAME].onTick)(creep);
}

const profiler = require('screepers.profiler');

module.exports = {
	init: profiler.registerFN(init, "bespoke.init"),
	run: profiler.registerFN(run, "bespoke.run"),
	serialize: profiler.registerFN(serialize, "bespoke.serialize"),
	deserialize: profiler.registerFN(deserialize, "bespoke.deserialize"),
};
