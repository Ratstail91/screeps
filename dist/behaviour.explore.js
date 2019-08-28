/* DOCS: explore behaviour
 * Search out and pass through null exits recorded in the map, updating them as you go.
 * This behaviour is designed to go under RECORD, but may work independently.
*/

const { EXPLORE: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

//const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_targetPos: null,
		_currentDirection: null,
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//have you moved rooms?
	if (creep.memory[BEHAVIOUR_NAME]._targetPos != null && creep.memory[BEHAVIOUR_NAME]._currentDirection != null && creep.room.name != creep.memory[BEHAVIOUR_NAME]._targetPos.roomName) {
		//record the movement on the map (previous room)
		Memory.map.rooms[creep.memory[BEHAVIOUR_NAME]._targetPos.roomName].exits[creep.memory[BEHAVIOUR_NAME]._currentDirection] = creep.room.name;

		//record this side too (new room)
		let backwards = null;

		switch(creep.memory[BEHAVIOUR_NAME]._currentDirection) {
			case "north":
				backwards = "south";
				break;

			case "south":
				backwards = "north";
				break;

			case "east":
				backwards = "west";
				break;

			case "west":
				backwards = "east";
				break;
		}

		//only record on this side if this room (the new room) is recorded
		if (Memory.map.rooms[creep.room.name]) {
			Memory.map.rooms[creep.room.name].exits[backwards] = creep.memory[BEHAVIOUR_NAME]._targetPos.roomName;

			//if closer to another spawn
			let distance = Game.map.getRoomLinearDistance(creep.room.name, creep.memory.origin, true);

			if (distance < Memory.map.rooms[creep.room.name].distance) {
				Memory.map.rooms[creep.room.name].distance = distance;
			}
		}

		//clear the state
		creep.memory[BEHAVIOUR_NAME]._targetPos = null;
		creep.memory[BEHAVIOUR_NAME]._currentDirection = null;
	}

	//get the current room's data
	const roomRecord = Memory.map.rooms[creep.room.name];

	//if this room is not recorded, do nothing
	if (!roomRecord) {
		return true;
	}

	//set the targetPos
	if (creep.memory[BEHAVIOUR_NAME]._targetPos === null) {
		if (roomRecord.exits.north === null && setTargetPos(creep, FIND_EXIT_TOP, "north")) {
			//DO NOTHING
		} else if (roomRecord.exits.south === null  && setTargetPos(creep, FIND_EXIT_BOTTOM, "south")) {
			//DO NOTHING
		} else if (roomRecord.exits.east === null && setTargetPos(creep, FIND_EXIT_RIGHT, "east")) {
			//DO NOTHING
		} else if (roomRecord.exits.west === null && setTargetPos(creep, FIND_EXIT_LEFT, "west")) {
			//DO NOTHING
		} else {
			//no valid targets here, lets find a null (or pass downwards)
			if (!setTargetPosDistant(creep)) {
				return true;
			}
		}
	}

	//move towards the target
	let moveResult = creep.moveTo(new RoomPosition(creep.memory[BEHAVIOUR_NAME]._targetPos.x, creep.memory[BEHAVIOUR_NAME]._targetPos.y, creep.memory[BEHAVIOUR_NAME]._targetPos.roomName), { reusePath: 100 });

	switch(moveResult) {
		case OK:
		case ERR_TIRED:
			break;

		case ERR_NO_PATH:
			creep.memory[BEHAVIOUR_NAME]._targetPos = null;
			break;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
	}

	//stop here
	return false;
}

function setTargetPos(creep, dir, dirString) {
	const exits = creep.room.find(dir);

	if (exits.length > 0) {
		creep.memory[BEHAVIOUR_NAME]._targetPos = exits[0];
		creep.memory[BEHAVIOUR_NAME]._currentDirection = dirString;

		return true;
	}

	return false;
}

//cached during ticks
targets = [];

function setTargetPosDistant(creep) {
	if (targets.length == 0) {
		//find all nulls
		for (let roomName of Object.keys(Memory.map.rooms)) {
			//only need a complete map of the nearby regions
			if (Memory.map.rooms[roomName].distance > 8) {
				continue;
			}

			for (let exitName of Object.keys(Memory.map.rooms[roomName].exits)) {
				if (Memory.map.rooms[roomName].exits[exitName] === null) {
					targets.push({
						x: 0, y: 0, roomName: roomName
					});
				}
			}
		}
	}

	if (targets.length == 0) {
		return false;
	}

	creep.memory[BEHAVIOUR_NAME]._targetPos = targets[Math.floor(Math.random() * targets.length)];
	return true;
}

module.exports = {
	init,
	run
};
