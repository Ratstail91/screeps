/* DOCS: harvest behaviour
 * This behaviour makes creeps draw energy from a source until full.
 * The options are visibile in init(creep).
 * This behaviour interacts with TOP.
*/

//TODO: add target locking

const { HARVEST: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');
const { countRemotes } = require('spawns.utils');

const pathStyle = { stroke: '#ff00ff' };

/* DOCS: init(creep)
 * Initialize harvest behaviour for "creep".
*/
function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		remote: null,
		source: null,
		lockToSource: false, //don't switch sources when they run out
		skipOnFull: false,
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

/* DOCS: run(creep)
 * Run harvest behaviour for "creep".
*/
function run(creep) {
	//if belly is full
	if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
		//pass the logic to the next behaviour
		if (creep.memory[BEHAVIOUR_NAME].skipOnFull) {
			return true;
		}

		//otherwise, drop/move to the nearest container
		const container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER });

		if (container && !creep.pos.isEqualTo(container.pos)) {
			const moveResult = creep.moveTo(container.pos, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

			switch(moveResult) {
				case OK:
				case ERR_TIRED:
				case ERR_NO_PATH:
					creep.transfer(container, RESOURCE_ENERGY);
					return false;

				default:
					throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
			}
		} else {
			creep.drop(RESOURCE_ENERGY);
			//continue with the behaviour
		}
	}

	//move to a specified (or random) remote
	if (creep.memory[BEHAVIOUR_NAME].remote == null) {
		creep.memory[BEHAVIOUR_NAME].remote = Math.floor(Math.random() * countRemotes(creep.memory.origin));
		creep.memory[BEHAVIOUR_NAME].source = null;
	}

	const remoteName = `${creep.memory.origin}remote${creep.memory[BEHAVIOUR_NAME].remote}`;

	countRemotes(creep.memory.origin); //NOTE: hack

	//if not in the remote's room
	if (Memory.spawns[creep.memory.origin] && creep.room.name != Memory.spawns[creep.memory.origin].remotes[remoteName].roomName) {
		let remotePos = new RoomPosition(Memory.spawns[creep.memory.origin].remotes[remoteName].x, Memory.spawns[creep.memory.origin].remotes[remoteName].y, Memory.spawns[creep.memory.origin].remotes[remoteName].roomName);
		const moveResult = creep.moveTo(remotePos, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

		if (moveResult == OK) {
			return false;
		} else if (moveResult == ERR_NO_PATH) {
			//corner case: can't get out...
			creep.memory[BEHAVIOUR_NAME].remote = null;
			creep.memory[BEHAVIOUR_NAME].source = null;
			return false;
		}
	}

	//harvest energy (sorted)
	const sources = creep.room.find(FIND_SOURCES).sort((a, b) => {
		if (a.pos.x == b.pos.x) {
			return a.pos.y < b.pos.y;
		} else {
			return a.pos.x < b.pos.x;
		}
	});

	//target a random source to free up real estate
	if (creep.memory[BEHAVIOUR_NAME].source == null || creep.memory[BEHAVIOUR_NAME].source >= sources.length) {
		creep.memory[BEHAVIOUR_NAME].source = Math.floor(Math.random() * sources.length);
	}

	const harvestResult = creep.harvest(sources[creep.memory[BEHAVIOUR_NAME].source]);

	switch(harvestResult) {
		case OK:
			//everything is OK, send a '_lock' message to TOP
			creep.memory[BEHAVIOUR_NAME]._lock = true;
			return false;

		case ERR_NOT_IN_RANGE: {
			const moveResult = creep.moveTo(sources[creep.memory[BEHAVIOUR_NAME].source], {reusePath: REUSE_PATH, visualizePathStyle: pathStyle});

			//no path to this source, then deselect this source (and this remote)
			if (moveResult == ERR_NO_PATH) {
				creep.memory[BEHAVIOUR_NAME].remote = null;
				creep.memory[BEHAVIOUR_NAME].source = null;
			}

			return false;
		}

		case ERR_NOT_OWNER:
		case ERR_NOT_ENOUGH_RESOURCES:
			if (!creep.memory[BEHAVIOUR_NAME].lockToSource) {
				//go to a random remote and source
				creep.memory[BEHAVIOUR_NAME].remote = null;
				creep.memory[BEHAVIOUR_NAME].source = null;
			}
			return false;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: harvestResult ${harvestResult}`);
	}
}

module.exports = {
	init: init,
	run: run
};