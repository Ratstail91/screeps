const { WITHDRAW: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores, CONTAINER, STORAGE } = require('store.utils');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

//TODO: All of the code completely ignores all resources except energy.

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
	if (creep.memory[BEHAVIOUR_NAME].skipIfNotEmpty && !creep.memory[BEHAVIOUR_NAME].forceIfNotFull && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
		return true;
	}

	//can't withdraw on an full stomach
	if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
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
	//WARNING: bad naming
	const stores = getStores(creep, creep.memory[BEHAVIOUR_NAME].stores || [CONTAINER, STORAGE])
		.filter(store => store.store[RESOURCE_ENERGY] > 0);

	if (stores.length == 0) {
		//nothing to withdraw from
		return true;
	}

	const transferResult = creep.withdraw(stores[0], RESOURCE_ENERGY);

	switch(transferResult) {
		case OK:
			//everything is OK
			return false;

		case ERR_NOT_IN_RANGE: {
			const moveResult = creep.moveTo(stores[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

			if (moveResult == OK || moveResult == ERR_TIRED) {
				return false;
			} else if (moveResult == ERR_NO_PATH) {
				return true;
			}

			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
		}

		case ERR_NOT_ENOUGH_RESOURCES:
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

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: transferResult ${transferResult}, stores length ${stores.length}, my controller ${creep.room.controller.my}`);
	}
}

module.exports = {
	init,
	run,
};