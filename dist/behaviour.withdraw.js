const { WITHDRAW: BEHAVIOUR_NAME } = require('behaviour_names');

const { getStores, checkIsStoreEmpty, CONTAINER, STORAGE } = require('utils.store');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//initialize new creeps
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		skipIfNotEmpty: false
	}, creep.memory[BEHAVIOUR_NAME]);

	//skip withdrawing if not empty
	if (creep.memory[BEHAVIOUR_NAME].skipIfNotEmpty && _.sum(creep.carry) > 0) {
		return true;
	}

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
	const stores = getStores(creep, creep.memory[BEHAVIOUR_NAME].stores || [CONTAINER, STORAGE])
		.filter(store => !checkIsStoreEmpty(store));

	const transferResult = creep.withdraw(stores[0], RESOURCE_ENERGY);

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
