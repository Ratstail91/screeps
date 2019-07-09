const MAX_REMOTES = 4;

function roleLength(creeps, role, origin) {
	const collection = _.filter(creeps, (creep) => {
		return creep.memory.role && creep.memory.role == role && creep.memory.origin == origin
	});

	return collection.length;
}

function domesticSpawn(origin, max, roleName, type = 'small', remote = null, source = null) {
	if (roleLength(Game.creeps, roleName, origin) >= max) {
		return;
	}

	//determine the size to use
	let body;
	switch(type) {
		case 'small': //250
			body = [MOVE, MOVE, WORK, CARRY];
			break;

		case 'medium': //700
			body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
			break;

		case 'large': //1200
			body = [
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, CARRY, //100
				MOVE, WORK, //150
				MOVE, WORK, //150
			];
			break;

		default:
			throw new Error(`Unknown domestic spawn type ${type}`);
	}

	return Game.spawns[origin].spawnCreep(
		body,
		roleName + Game.time,
		{ memory: { origin: origin, role: roleName, working: false, dumpEnergy: false, remote: remote, source: source }}
	);
}

function getStores(creep) {
	const towers = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity && structure.my
	});

	const spawns = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity && structure.my
	});

	const extensions = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity && structure.my
	});

	const containers = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
	});

	const storage = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
	});

	return [...towers, ...spawns, ...extensions, ...containers, ...storage];
}

function defendSpawn(spawnName) {
	const hostiles = Game.spawns[spawnName].room.find(FIND_HOSTILE_CREEPS);

	if (hostiles.length == 0) {
		return;
	}

	const username = hostiles[0].owner.username;
	Game.notify(`User ${username} spotted near ${spawnName}`);

	const towers = Game.spawns[spawnName].room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
	towers.forEach(tower => tower.attack(hostiles[0]));
}

function excludeUnreachable(creep, targets, loops = 100) {
	//loop over the targets up to 100 times (for CPU's sake)
	for (let i = 0; i < loops; i++) {
		if (targets.length == 0) {
			return targets;
		}

		//paths connect?
		const pathResult = creep.room.findPath(creep.pos, targets[0].pos);

		//if sitting on the target
		if (pathResult.length == 0) {
			continue;
		}

		const pathEndPos = creep.room.getPositionAt(pathResult[pathResult.length-1].x, pathResult[pathResult.length-1].y);

		if (!pathEndPos.isEqualTo(targets[0].pos)) {
			creep.memory.exclude[targets[0].id] = true;
			targets.shift();
			continue;
		}

		//check for ramparts (because attacks against ramparts return OK)
		let ramparts = findRampartsAt(creep, targets[0].pos);
		if (ramparts.length > 0) {
			creep.memory.exclude[targets[0].id] = true;
			targets.shift();
			continue;
		}

		//didn't alter the targets this loop
		break;
	}
	
	return targets;
}

function findRampartsAt(creep, pos) {
	return creep.room.find(FIND_HOSTILE_STRUCTURES , {filter: (structure) => structure.structureType == STRUCTURE_RAMPART && structure.pos.isEqualTo(pos) });
}

module.exports = {
	MAX_REMOTES: MAX_REMOTES,
	roleLength: roleLength,
	domesticSpawn: domesticSpawn,
	getStores: getStores,
	defendSpawn: defendSpawn,
	excludeUnreachable: excludeUnreachable
};
