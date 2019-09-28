/* DOCS: upgrade behaviour
 * This behaviour makes creeps upgrade the controller in their room of origin.
 * This behaviour interacts with TOP.
*/

const { UPGRADE: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

/* DOCS: init(creep)
 * Initialize upgrade behaviour for "creep".
*/
function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

/* DOCS: run(creep)
 * Run upgrade behaviour for "creep".
*/
function run(creep) {
	//if can't upgrade this controller, go home
	if (!creep.room.controller || !creep.room.controller.my) {
		//if not home
		const originSpawns = creep.room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_SPAWN && structure.name == creep.memory.origin });
		if (originSpawns.length == 0) {
			//go home
			creep.moveTo(Game.spawns[creep.memory.origin], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle, range: 3 });
			return false;
		}
	}

	const upgradeResult = creep.upgradeController(creep.room.controller);

	switch(upgradeResult) {
		case OK:
			//everything is OK, send a '_lock' message to TOP
			creep.memory[BEHAVIOUR_NAME]._lock = true;
			return false;

		case ERR_NOT_IN_RANGE:
			//move towards the target
			creep.moveTo(creep.room.controller, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle, range: 3 });
			return false;

		case ERR_NOT_ENOUGH_RESOURCES:
			//pass downwards
			return true;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: upgradeResult ${upgradeResult}`);
	}
}

module.exports = {
	init: init,
	run: run
};