const think = creep => {
	//init memory
	if (!creep.memory.repair) {
		creep.memory.repair = {};
	}

	//process locking
	if (creep.memory.repair.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.repair.locked = false;
	}

	//find a repair target
	const target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
		filter: s => s.hits < s.hitsMax
	});

	if (target) {
		creep.memory.repair.targetId = target.id;
	} else {
		//no "my" targets found, instead try repairing a neutral structure
		const neutralTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: s => s.hits < s.hitsMax * (s.structureType == STRUCTURE_WALL ? 0 : 1) //NOTE: don't repair walls to their full value
		});

		if (neutralTarget) {
			creep.memory.repair.targetId = neutralTarget.id;
		} else {
			//finally
			creep.memory.repair.targetId = null;
		}
	}

	return true;
};

const act = creep => {
	if (creep.memory.repair.targetId && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
		const target = Game.getObjectById(creep.memory.repair.targetId);

		if (creep.repair(target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
			return false;
		}

		creep.memory.repair.locked = true;

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
