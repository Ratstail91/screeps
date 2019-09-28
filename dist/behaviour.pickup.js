/* DOCS: pickup behaviour
 * Pickup from the ground or collect any energy that has been dropped.
 * TODO: expand this to handle minerals
*/

const { PICKUP: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//if belly is full, pass the logic to the next behaviour
	if (_.sum(creep.carry) == creep.carryCapacity) {
		return true;
	}

	//target energy
	let energies = creep.room.find(FIND_DROPPED_RESOURCES).filter(r => r.resourceType == RESOURCE_ENERGY); //TODO: handle non-energy resources

	if (energies.length > 0) {
		const pickupResult = creep.pickup(energies[0]);

		switch(pickupResult) {
			case OK:
				//DO NOTHING
				return false;

			case ERR_NOT_IN_RANGE:
				creep.moveTo(energies[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
				return false;

			default:
				throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: pickupResult ${pickupResult}`);
		}
	}

	//target tombstones
	const tombstones = creep.room.find(FIND_TOMBSTONES, { filter: ts => ts.store[RESOURCE_ENERGY] > 0 });

	if (tombstones.length > 0) {
		const tombstoneResult = creep.withdraw(tombstones[0], RESOURCE_ENERGY);

		switch(tombstoneResult) {
			case OK:
				//DO NOTHING
				return false;

			case ERR_NOT_IN_RANGE:
				creep.moveTo(tombstones[0], { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
				return false;

			default:
				throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: tombstoneResult ${tombstoneResult}`);
		}		
	}

	//fall through if nothing found
	return true;
}

module.exports = run;