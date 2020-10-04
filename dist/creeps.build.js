const think = creep => {
	//init memory
	if (!creep.memory.build) {
		creep.memory.build = {};
	}

	//process locking
	if (creep.memory.build.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.build.locked = false;
	}

	//find a construction site
	const site = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);

	if (site) {
		creep.memory.build.targetId = site.id;
	} else {
		//no sites found
		creep.memory.build.targetId = null;
	}

	//don't build afterall if your store is empty
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		creep.memory.build.targetId = null;
	}

	return true;
};

const act = creep => {
	if (creep.memory.build.targetId) {
		const target = Game.getObjectById(creep.memory.build.targetId);

		if (creep.build(target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
			return false;
		}

		//lock into this action
		creep.memory.build.locked = true;

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
