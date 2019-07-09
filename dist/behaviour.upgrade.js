const { UPGRADE: BEHAVIOUR_NAME } = require('behaviour_names');

const { MAX_REMOTES, REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//initialize new creeps
	if (!creep.memory[BEHAVIOUR_NAME]) {
		creep.memory[BEHAVIOUR_NAME] = {
			lock: false
		};
	}

	//if can't upgrade this controller, go home
	if (!creep.room.controller.my) {
		const homeFlags = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == 'home' });
		if (homeFlags.length == 0) {
			creep.moveTo(Game.flags['home'], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;
		}
	}

	const upgradeResult = creep.upgradeController(creep.room.controller);

	if (upgradeResult == OK) {
		//everything is OK, send a 'lock' message to TOP
		creep.memory[BEHAVIOUR_NAME].lock = true;
		return false;
	} else if (upgradeResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: upgradeResult ${upgradeResult}`);
}

module.exports = run;
