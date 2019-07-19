const { DEPOSIT: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores, checkIsStoreFull } = require('utils.store');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		skipIfNotFull: false,
		forceIfNotEmpty: false,
		returnHomeFirst: false,
		stores: null
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//skip depositing if not full
	if (creep.memory[BEHAVIOUR_NAME].skipIfNotFull && !creep.memory[BEHAVIOUR_NAME].forceIfNotEmpty && _.sum(creep.carry) != creep.carryCapacity) {
		return true;
	}

	//can't deposit on an empty stomach
	if (_.sum(creep.carry) == 0) {
		return true;
	}

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

	const transferResult = creep.transfer(stores[0], RESOURCE_ENERGY);

	if (transferResult == OK) {
		//everything is OK
		return false;
	} else if(transferResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(stores[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	} else if (transferResult == ERR_NOT_ENOUGH_RESOURCES) {
		//that thing can't go in there...
		return true;
	} else if (transferResult == ERR_FULL || stores.length == 0) {
		return true;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: transferResult ${transferResult}, stores length ${stores.length}, my controller ${creep.room.controller.my}`);
}

module.exports = {
	init: init,
	run: run
};
