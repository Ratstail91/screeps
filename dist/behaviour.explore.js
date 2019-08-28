/* DOCS: explore behaviour
 * Search out and pass through null exits recorded in the map, updating them as you go.
 * This behaviour is designed to go under RECORD, but may work independently.
*/

const { EXPLORE: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		_targetPos: null,
		_currentDirection: null,
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//have you moved rooms?
	if (creep.memory[BEHAVIOUR_NAME]._targetPos != null && creep.memory[BEHAVIOUR_NAME]._currentDirection != null && creep.room.name != creep.memory[BEHAVIOUR_NAME]._targetPos.roomName) {
		//record the movement on the map
		Memory.map.rooms[creep.memory[BEHAVIOUR_NAME]._targetPos.roomName].exits[creep.memory[BEHAVIOUR_NAME]._currentDirection] = creep.room.name;

		//record this side too
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

		//only record on this side if this room is recorded
		if (Memory.map.rooms[creep.room.name]) {
			Memory.map.rooms[creep.room.name].exits[backwards] = creep.memory[BEHAVIOUR_NAME]._targetPos.roomName;
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
	if (creep.memory[BEHAVIOUR_NAME]._targetPos == null) {
		if (roomRecord.exits.north == null && setTargetPos(creep, FIND_EXIT_TOP, "north")) {
			//DO NOTHING
		} else if (roomRecord.exits.south == null  && setTargetPos(creep, FIND_EXIT_BOTTOM, "south")) {
			//DO NOTHING
		} else if (roomRecord.exits.east == null && setTargetPos(creep, FIND_EXIT_RIGHT, "east")) {
			//DO NOTHING
		} else if (roomRecord.exits.west == null && setTargetPos(creep, FIND_EXIT_LEFT, "west")) {
			//DO NOTHING
		} else {
			//no valid targets here, lets find a null
			setTargetPosDistant(creep);
		}
	}

	//move towards the target
	let moveResult = creep.moveTo(new RoomPosition(creep.memory[BEHAVIOUR_NAME]._targetPos.x, creep.memory[BEHAVIOUR_NAME]._targetPos.y, creep.memory[BEHAVIOUR_NAME]._targetPos.roomName), { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

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

function setTargetPosDistant(creep) {
	for (let roomName of Object.keys(Memory.map.rooms)) {
		for (let exitName of Object.keys(Memory.map.rooms[roomName].exits)) {
			if (Memory.map.rooms[roomName].exits[exitName] == null) {
				creep.memory[BEHAVIOUR_NAME]._targetPos = {
					x: 0, y: 0, roomName: roomName
				}

				console.log(roomName, exitName);
				return;
			}
		}
	}
}

module.exports = {
	init,
	run
};
