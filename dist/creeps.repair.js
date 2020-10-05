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
			filter: s => {
				if (s.structureType == STRUCTURE_WALL) return false; //don't repair walls
				if (s.structureType == STRUCTURE_CONTAINER) s.hits < (s.hitsMax * 0.6); //let containers decay a lot
				return s.hits < s.hitsMax;
			}
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

		if (target.hits == target.hitsMax) {
			return true;
		}

		const result = creep.repair(target);

		if (result == ERR_NOT_IN_RANGE) {
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
