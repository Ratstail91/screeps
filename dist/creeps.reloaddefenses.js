/* DOCS: refill towers
*/

const think = creep => {
	//init memory
	if (!creep.memory.reloadDefenses) {
		creep.memory.reloadDefenses = {};
	}

	//don't bother stashing if you're empty
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		creep.memory.reloadDefenses.targetId = null;
		return true;
	}

	//find the weapons
	const weapons = creep.room.find(FIND_MY_STRUCTURES, {
		filter: s => {
			return s.structureType == STRUCTURE_TOWER
		}
	});

	if (weapons.length > 0) {
		creep.memory.reloadDefenses.targetId = weapons[0].id;
	}

	return true;
};

const act = creep => {
	if (creep.memory.reloadDefenses.targetId) {
		const target = Game.getObjectById(creep.memory.reloadDefenses.targetId);

		const result = creep.transfer(target, RESOURCE_ENERGY);

		if (result == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
