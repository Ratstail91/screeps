/* DOCS: stash is explicitly for taking to a spawn or extension
*/

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
	const homeRoom = _.filter(Game.rooms, r => r.id == creep.memory.homeId)[0]; //NOTE: would probably break if I lose a room

	const extension = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
		filter: s => s.structureType == STRUCTURE_EXTENSION && s.room.id == homeRoom.id && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
	});

	if (extension) {
		creep.memory.stash.targetId = extension.id;
	} else {
		//no extension, stash at a spawn
		const targetSpawns = _.filter(Game.live[homeRoom.name].mySpawns, s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

		if (targetSpawns.length > 0) {
			creep.memory.stash.targetId = targetSpawns[0].id;
		} else {
			//TODO: error?
//			console.log(creep.name + ': Nowhere to stash this energy!');
			creep.memory.stash.targetId = null;
		}
	}

	return true;
};

const act = creep => {
	//assume stash.targetId is set elsewhere
	if (creep.memory.stash.targetId) {
		const target = Game.getObjectById(creep.memory.stash.targetId);

		if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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
