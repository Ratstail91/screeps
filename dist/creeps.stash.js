/* DOCS: stash is explicitly for taking to a spawn or extension
*/

//TODO: refill towers in a separate behaviour

const think = creep => {
	//init memory
	if (!creep.memory.stash) {
		creep.memory.stash = {};
	}

	//don't bother stashing if you're empty
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		creep.memory.stash.targetId = null;
		return true;
	}

	//find the closest extension in home room
	const homeRoom = Game.rooms[creep.memory.homeName]; //NOTE: would probably break if I lose a room

	const extension = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
		filter: s => s.structureType == STRUCTURE_EXTENSION && s.room.name == homeRoom.name && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
	});

	if (extension) {
		creep.memory.stash.targetId = extension.id;
	} else {
		//no extension, stash at a spawn
		const targetSpawns = _.filter(Game.live[homeRoom.name].mySpawns, s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

		if (targetSpawns.length > 0) {
			creep.memory.stash.targetId = targetSpawns[0].id;
		} else {
//			console.log(creep.name + ': Nowhere to stash this energy!');
			creep.memory.stash.targetId = null;
		}
	}

	//process locking
	if (creep.memory.stash.targetId == null) {
		creep.memory.stash.locked = false;
	}

	if (creep.memory.stash.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.stash.locked = false;
	}

	return true;
};

const act = creep => {
	//assume stash.targetId is set elsewhere
	if (creep.memory.stash.targetId) {
		const target = Game.getObjectById(creep.memory.stash.targetId);

		const result = creep.transfer(target, RESOURCE_ENERGY);

		if (result == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}

		//lock into this action
		creep.memory.stash.locked = true;

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
