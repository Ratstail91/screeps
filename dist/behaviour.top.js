/* DOCS: bottom behaviour
 * This behaviour bookends the behaviour stack, and is used by other behaviours.
*/

const { TOP: BEHAVIOUR_NAME, HARVEST, UPGRADE, BUILD, REPAIR } = require('behaviour_names');

const harvest = require('behaviour.harvest');
const upgrade = require('behaviour.upgrade');
const build = require('behaviour.build');
const repair = require('behaviour.repair');

function run(creep) {
	if (creep.memory[HARVEST] && creep.memory[HARVEST]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[HARVEST]._lock = false;

		//run until full
		if (_.sum(creep.carry) != creep.carryCapacity) {
			return harvest.run(creep);
		}
	}

	if (creep.memory[UPGRADE] && creep.memory[UPGRADE]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[UPGRADE]._lock = false;

		//run until empty
		if (_.sum(creep.carry) != 0) {
			return upgrade.run(creep);
		}
	}

	if (creep.memory[BUILD] && creep.memory[BUILD]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[BUILD]._lock = false;

		//run until empty
		if (_.sum(creep.carry) != 0) {
			return build.run(creep);
		}
	}

	if (creep.memory[REPAIR] && creep.memory[REPAIR]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[REPAIR]._lock = false;

		//run until empty
		if (_.sum(creep.carry) != 0) {
			return repair.run(creep, true);
		}
	}

	//no-op
	return true;
}

module.exports = run;