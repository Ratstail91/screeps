const { WITHDRAW: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores, checkIsStoreEmpty, CONTAINER, STORAGE } = require('utils.store');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		skipIfNotEmpty: false,
		forceIfNotFull: false,
		skipOwnRoom: false,
		skipOriginRoom: false,
		stores: null
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//skip withdrawing if not empty
	if (creep.memory[BEHAVIOUR_NAME].skipIfNotEmpty && !creep.memory[BEHAVIOUR_NAME].forceIfNotFull && _.sum(creep.carry) > 0) {
		return true;
	}

	//can't withdraw on an full stomach
	if (_.sum(creep.carry) == creep.carryCapacity) {
		return true;
	}

	//skip in rooms owned by me
	if (creep.memory[BEHAVIOUR_NAME].skipOwnRoom && creep.room.controller.my) {
		return true;
	}

	//skip the creep's origin room
	const spawns = creep.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN && s.name == creep.memory.origin });

	if (creep.memory[BEHAVIOUR_NAME].skipOriginRoom && spawns.length != 0) {
		return true;
	}

	//get the stores
	const stores = getStores(creep, creep.memory[BEHAVIOUR_NAME].stores || [CONTAINER, STORAGE])
		.filter(store => !checkIsStoreEmpty(store));

	const transferResult = creep.withdraw(stores[0], RESOURCE_ENERGY);

	if (transferResult == OK) {
		//everything is OK
		return false;
	} else if(transferResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(stores[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	} else if (transferResult == ERR_NOT_ENOUGH_RESOURCES) {
		//something else in there?
		let transferEverythingResult = false;

		for (let i = 0; i < RESOURCES_ALL.length; i++) {
			if (creep.withdraw(stores[0], RESOURCES_ALL[i]) == OK) {
				transferEverythingResult = true;
			}
		}

		if (transferEverythingResult) {
			return false;
		}

		throw new Error(`Failure to withdraw misc. resources by ${creep.name}`);
	} else if (transferResult == ERR_FULL || stores.length == 0) {
		return true;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: transferResult ${transferResult}, stores length ${stores.length}, my controller ${creep.room.controller.my}`);
}

module.exports = {
	init: init,
	run: run
};
