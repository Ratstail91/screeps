const { HARVEST: BEHAVIOUR_NAME } = require('behaviour_names');

const { MAX_REMOTES, REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//initialize new creeps
	if (!creep.memory[BEHAVIOUR_NAME]) {
		creep.memory[BEHAVIOUR_NAME] = {
			remote: null,
			source: null
		};
	}

	//if belly is full, pass the logic to the next behaviour
	if (creep.carry.energy == creep.carryCapacity) {
		return true;
	}

	//move to a specified (or random) remote
	if (creep.memory[BEHAVIOUR_NAME].remote == null) {
		creep.memory[BEHAVIOUR_NAME].remote = Math.floor(Math.random() * MAX_REMOTES);
		creep.memory[BEHAVIOUR_NAME].source = null;
	}

	const remoteFlag = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == `remote${creep.memory[BEHAVIOUR_NAME].remote}` });
	if (remoteFlag.length == 0) {
		creep.moveTo(Game.flags[`remote${creep.memory[BEHAVIOUR_NAME].remote}`], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	}

	//harvest energy
	const sources = creep.room.find(FIND_SOURCES);

	//target a random source to free up real estate
	if (creep.memory[BEHAVIOUR_NAME].source == null || creep.memory[BEHAVIOUR_NAME].source >= sources.length) {
		creep.memory[BEHAVIOUR_NAME].source = Math.floor(Math.random() * sources.length);
	}

	const harvestResults = creep.harvest(sources[creep.memory[BEHAVIOUR_NAME].source]);

	//handle the results of trying to harvest
	if (harvestResults == OK) {
		//DO NOTHING
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
		//go to a random source
		creep.memory[BEHAVIOUR_NAME].remote = null;
		creep.memory[BEHAVIOUR_NAME].source = null;

		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: harvestResults ${harvestResults}`);
}

module.exports = run;
