/* DOCS: deposit behaviour
 * This behaviour makes creeps deposit their contents into a store.
 * The options are visibile in init(creep).
*/

const { DEPOSIT: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores } = require('store.utils');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

/* DOCS: init(creep)
 * Initialize deposit behaviour for "creep".
*/
function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		skipIfNotFull: false, //skip this behaviour if you're not full
		forceIfNotEmpty: false, //force, overrides the skip
		returnHomeFirst: false, //return to origin
		stores: null, //the stores to deposit into
		index: 0,
		resourceType: RESOURCE_ENERGY,
	}, creep.memory[BEHAVIOUR_NAME]);
}

/* DOCS: run(creep)
 * Run deposit behaviour for "creep".
*/
function run(creep) {
	//skip depositing if not full
	if (creep.store.getFreeCapacity(creep.memory[BEHAVIOUR_NAME].resourceType) != 0 && creep.memory[BEHAVIOUR_NAME].skipIfNotFull && !creep.memory[BEHAVIOUR_NAME].forceIfNotEmpty) {
		return true;
	}

	//can't deposit on an empty stomach
	if (creep.store.getUsedCapacity(creep.memory[BEHAVIOUR_NAME].resourceType) == 0) {
		return true;
	}

	//if return home is set
	if (creep.memory[BEHAVIOUR_NAME].returnHomeFirst) {
		//if not at home, go home
		const homeSpawns = creep.room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_SPAWN && structure.name == creep.memory.origin });
		if (homeSpawns.length == 0) {
			creep.moveTo(Game.spawns[creep.memory.origin], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;
		}
	}

	//get the stores
	//WARNING: bad naming here
	const stores = getStores(creep, creep.memory[BEHAVIOUR_NAME].stores)
		.filter(s => s.store.getFreeCapacity(creep.memory[BEHAVIOUR_NAME].resourceType) > 0) //WARNING: need to switch to a more generic resource system
	;

	//if no stores available, pass onwards
	if (stores.length == 0) {
		return true;
	}

	const transferResult = creep.transfer(stores[creep.memory[BEHAVIOUR_NAME].index], creep.memory[BEHAVIOUR_NAME].resourceType);

	switch(transferResult) {
		case OK:
			//everything is OK
			return false;

		case ERR_NOT_IN_RANGE:
			//move to the first available store
			creep.moveTo(stores[creep.memory[BEHAVIOUR_NAME].index], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;

		case ERR_NOT_ENOUGH_RESOURCES:
			//that thing can't go in there...

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: transferResult ${transferResult}, stores length ${stores.length}, my controller ${creep.room.controller.my}`);
	}
}

const profiler = require('screepers.profiler');

module.exports = {
	init: profiler.registerFN(init, "deposit.init"),
	run: profiler.registerFN(run, "deposit.run"),
};
