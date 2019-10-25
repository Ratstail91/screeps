/* DOCS: bottom behaviour
 * This behaviour bookends the behaviour stack, and is used by other behaviours.
*/

const { BOTTOM: BEHAVIOUR_NAME } = require('behaviour_names');

function run(creep) {
	//no-op
}

const profiler = require('screepers.profiler');

module.exports = profiler.registerFN(run, "bottom.run");
