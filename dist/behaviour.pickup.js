const { PICKUP: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//if belly is full, pass the logic to the next behaviour
	if (_.sum(creep.carry) == creep.carryCapacity) {
		return true;
	}

	//target energy (and other stuff)
	let energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
	energy = energy.resourceType == RESOURCE_ENERGY ? energy : null;

	if (energy) {
		const pickupResult = creep.pickup(energy);

		if (pickupResult == OK) {
			//DO NOTHING
			return false;
		} else if (pickupResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(energy, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;
		}

		throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: pickupResult ${pickupResult}`);
	}

	//target tombstones
	const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, { filter: ts => ts.store[RESOURCE_ENERGY] > 0 });

	if (tombstone) {
		const tombstoneResult = creep.withdraw(tombstone, RESOURCE_ENERGY);

		if (tombstoneResult == OK) {
			//DO NOTHING
			return false;
		} else if (tombstoneResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(tombstone, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
			return false;
		}

		throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: tombstoneResult ${tombstoneResult}`);
	}

	//fall through if nothing found
	return true;
}

module.exports = run;
