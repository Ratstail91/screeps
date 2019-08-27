/* DOCS: deposit behaviour
 * This behaviour makes creeps deposit their contents into a store.
 * The options are visibile in init(creep).
*/

const { DEPOSIT: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores, checkIsStoreFull } = require('store.utils');

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
	}, creep.memory[BEHAVIOUR_NAME]);
}

/* DOCS: init(creep)
 * Run deposit behaviour for "creep".
*/
function run(creep) {
	//skip depositing if not full
	if (_.sum(creep.carry) != creep.carryCapacity && creep.memory[BEHAVIOUR_NAME].skipIfNotFull && !creep.memory[BEHAVIOUR_NAME].forceIfNotEmpty) {
		return true;
	}

	//can't deposit on an empty stomach
	if (_.sum(creep.carry) == 0) {
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
	const stores = getStores(creep, creep.memory[BEHAVIOUR_NAME].stores)
		.filter(store => !checkIsStoreFull(store))
	;

	//if no stores available, pass onwards
	if (stores.length == 0) {
		return true;
	}

	const transferResult = creep.transfer(stores[0], RESOURCE_ENERGY);

	switch(transferResult) {
		case OK:
			//everything is OK
			return false;

		case ERR_NOT_IN_RANGE:
			//move to the first available store
			creep.moveTo(stores[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;

		case ERR_NOT_ENOUGH_RESOURCES:
			//that thing can't go in there...

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: transferResult ${transferResult}, stores length ${stores.length}, my controller ${creep.room.controller.my}`);
	}
}

module.exports = {
	init: init,
	run: run
};