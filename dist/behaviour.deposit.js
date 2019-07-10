const { DEPOSIT: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores } = require('utils');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//if not at home, go home
	const homeFlags = creep.room.find(FIND_FLAGS, { filter: flag => flag.name == 'home' });
	if (homeFlags.length == 0) {
		creep.moveTo(Game.flags['home'], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
		return false;
	}

	//get the storages
	const stores = getStores(creep);
	const transferResult = creep.transfer(stores[0], RESOURCE_ENERGY);

	if (transferResult == OK) {
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
