const { WITHDRAW: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores, TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE } = require('utils');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//if not at home, go home
	const homeFlags = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == 'home' });
	if (homeFlags.length == 0) {
		//TODO: replace the home flag with the origin spawn position
		creep.moveTo(Game.flags['home'], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	}

	//can't withdraw on an full stomach
	if (_.sum(creep.carry) == creep.carryCapacity) {
		return true;
	}

	//get the stores
	const stores = getStores(creep, [CONTAINER, STORAGE]);
	const transferResult = creep.withdraw(stores[0], RESOURCE_ENERGY);

	if (transferResult == OK || transferResult == ERR_NOT_ENOUGH_RESOURCES) {
		//everything is OK
		return false;
	} else if(transferResult == ERR_NOT_IN_RANGE) {
		creep.moveTo(stores[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	} else if (transferResult == ERR_FULL || stores.length == 0) {
		return true;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: transferResult ${transferResult}, stores length ${stores.length}, my controller ${creep.room.controller.my}`);
}

module.exports = run;
