const { HARVEST: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');
const { countRemotes } = require('utils.remotes');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		remote: null,
		source: null,
		lockToSource: false,
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//if belly is full, pass the logic to the next behaviour
	if (_.sum(creep.carry) == creep.carryCapacity) {
		return true;
	}

	//move to a specified (or random) remote
	if (creep.memory[BEHAVIOUR_NAME].remote == null) {
		creep.memory[BEHAVIOUR_NAME].remote = Math.floor(Math.random() * countRemotes(creep.memory.origin));
		creep.memory[BEHAVIOUR_NAME].source = null;
	}

	const remoteFlagName = `${creep.memory.origin}remote${creep.memory[BEHAVIOUR_NAME].remote}`;

	const remoteFlag = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == remoteFlagName });
	if (remoteFlag.length == 0) {
		const moveResult = creep.moveTo(Game.flags[remoteFlagName], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

		if (moveResult == OK) {
			return false;
		} else if (moveResult == ERR_NO_PATH) {
			//corner case: can't get out...
			creep.memory[BEHAVIOUR_NAME].remote = null;
			creep.memory[BEHAVIOUR_NAME].source = null;
			return false;
		}
	}

	//harvest energy (sorted)
	const sources = creep.room.find(FIND_SOURCES).sort((a, b) => {
		if (a.pos.x == b.pos.x) {
			return a.pos.y < b.pos.y;
		} else {
			return a.pos.x < b.pos.x;
		}
	});

	//target a random source to free up real estate
	if (creep.memory[BEHAVIOUR_NAME].source == null || creep.memory[BEHAVIOUR_NAME].source >= sources.length) {
		creep.memory[BEHAVIOUR_NAME].source = Math.floor(Math.random() * sources.length);
	}

	const harvestResults = creep.harvest(sources[creep.memory[BEHAVIOUR_NAME].source]);

	//handle the results of trying to harvest
	if (harvestResults == OK) {
		//everything is OK, send a '_lock' message to TOP
		creep.memory[BEHAVIOUR_NAME]._lock = true;
		return false;
	} else if(harvestResults == ERR_NOT_IN_RANGE) {
		const moveResult = creep.moveTo(sources[creep.memory[BEHAVIOUR_NAME].source], {reusePath: REUSE_PATH, visualizePathStyle: pathStyle});

		//no path to this source, then deselect this source (and this remote)
		if (moveResult == ERR_NO_PATH) {
			creep.memory[BEHAVIOUR_NAME].remote = null;
			creep.memory[BEHAVIOUR_NAME].source = null;
		}

		return false;
	} else if (harvestResults == ERR_NOT_ENOUGH_RESOURCES) {
		if (!creep.memory[BEHAVIOUR_NAME].lockToSource) {
			//go to a random source
			creep.memory[BEHAVIOUR_NAME].remote = null;
			creep.memory[BEHAVIOUR_NAME].source = null;
		}

		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: harvestResults ${harvestResults}`);
}

module.exports = {
	init: init,
	run: run
};
