const { TOP: BEHAVIOUR_NAME, HARVEST, UPGRADE, BUILD, REPAIR } = require('behaviour_names');

const harvest = require('behaviour.harvest');
const upgrade = require('behaviour.upgrade');
const build = require('behaviour.build');
const repair = require('behaviour.repair');

function run(creep) {
	if (creep.memory[HARVEST] && creep.memory[HARVEST]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[HARVEST]._lock = false;

		if (_.sum(creep.carry) != 0) {
			return harvest(creep);
		}
	}

	if (creep.memory[UPGRADE] && creep.memory[UPGRADE]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[UPGRADE]._lock = false;

		if (_.sum(creep.carry) != 0) {
			return upgrade(creep);
		}
	}

	if (creep.memory[BUILD] && creep.memory[BUILD]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[BUILD]._lock = false;

		if (_.sum(creep.carry) != 0) {
			return build(creep);
		}
	}

	if (creep.memory[REPAIR] && creep.memory[REPAIR]._lock) {
		//prevent permanent locking if something goes haywire
		creep.memory[REPAIR]._lock = false;

		if (_.sum(creep.carry) != 0) {
			return repair(creep);
		}
	}

	//no-op
	return true;
}

module.exports = run;
