const { getMatchingTask } = require('tasks');

const handleCreep = creep => {
	//busy
	if (creep.spawning) {
		return 0;
	}

	switch(creep.memory.type) {
		case 'harvester':
			return handleHarvester(creep);

		case 'builder':
			return handleBuilder(creep);

		case 'upgrader':
			return handleUpgrader(creep);

		default:
			throw "Unknown creep type: " + creep.memory.type;
	}
};

const handleHarvester = creep => {
	//deposit first
	if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
		return depositStore(creep, c => c.drop(RESOURCE_ENERGY));
	}

	const task = creep.memory.task || getMatchingTask('HARVEST', { room: creep.room, assigned: creep });

	if (!task) {
		return 0;
	}

	const harvestResult = creep.harvest(Game.getObjectById(task.target.id));

	switch(harvestResult) {
		case OK:
		case ERR_TIRED:
			assignCreepToTask(creep, task);
			return 0;

		case ERR_NOT_IN_RANGE:
			assignCreepToTask(creep, task);
			return moveCreepTowards(creep, Game.getObjectById(task.target.id))

		default:
			throw "Unknown harvestResult: " + harvestResult;
	}
};

const handleBuilder = creep => {
	//withdraw first
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
		return pickupResource(creep) && withdrawStore(creep);
	}

	const task = creep.memory.task || getMatchingTask('BUILD', { room: creep.room, assigned: creep });

	if (!task) {
		return 0;
	}

	const buildResult = creep.build(Game.getObjectById(task.target.id));

	switch(buildResult) {
		case OK:
		case ERR_TIRED:
			assignCreepToTask(creep, task);
			return;

			case ERR_NOT_IN_RANGE:
			assignCreepToTask(creep, task);
			return moveCreepTowards(creep, Game.getObjectById(task.target.id));

		default:
			throw "Unknown buildResult: " + harvestResult;
	}
};

const handleUpgrader = creep => {
	//withdraw first
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
		return pickupResource(creep) && withdrawStore(creep);
	}

	const task = creep.memory.task || getMatchingTask('UPGRADE', { room: creep.room, assigned: creep });

	if (!task) {
		return 0;
	}

	const upgradeResult = creep.upgradeController(Game.getObjectById(task.target.id));

	switch(upgradeResult) {
		case OK:
		case ERR_TIRED:
			assignCreepToTask(creep, task);
			return;

			case ERR_NOT_IN_RANGE:
			assignCreepToTask(creep, task);
			return moveCreepTowards(creep, Game.getObjectById(task.target.id));

		default:
			throw "Unknown upgradeResult: " + harvestResult;
	}
};

//utils
const depositStore = (creep, tooFar) => {
	const store = filterClosestStore(creep.pos);

	if (!store) {
		return 0;
	}

	const transferResult = creep.transfer(store, RESOURCE_ENERGY);

	switch(transferResult) {
		case OK:
		case ERR_TIRED:
			return 0;

		case ERR_NOT_IN_RANGE:
			if (tooFar) {
				return tooFar(creep);
			}
			return moveCreepTowards(creep, store);

		default:
			throw "Unknown transferResult: " + transferResult;
	}
};

const withdrawStore = creep => {
	const store = filterClosestStore(creep.pos);

	if (!store) {
		return 0;
	}

	const withdrawResult = creep.withdraw(store, RESOURCE_ENERGY);

	switch(withdrawResult) {
		case OK:
		case ERR_TIRED:
			return 0;

		case ERR_NOT_IN_RANGE:
			return moveCreepTowards(creep, store);

		default:
			throw "Unknown withdrawResult: " + withdrawResult;
	}
}

const pickupResource = creep => {
	const energy = creep.room.find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_ENERGY });

	if (!energy) {
		return true; //continue
	}

	const pickupResult = creep.pickup(energy[0]);

	switch(pickupResult) {
		case OK:
		case ERR_TIRED:
			break;

		case ERR_NOT_IN_RANGE:
			moveCreepTowards(creep, energy[0]);
			break;
	}

	return 0; //exit
}

//utils
const moveCreepTowards = (creep, target) => {
	return creep.moveTo(target, { reusePath: 10 });
};

const filterClosestStore = pos => {
	return pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => (structure.my !== false) && !!structure.store && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
};

const assignCreepToTask = (creep, task) => {
	creep.memory.task = task;
//	task.assigned = creep;
};

module.exports = {
	handleCreep,
};