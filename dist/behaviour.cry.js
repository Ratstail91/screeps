const { CRY: BEHAVIOUR_NAME } = require('behaviour_names');

function run(creep) {
	//if hostiles found
	const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

	if (hostiles.length > 0) {
		createCry(creep.room.name);
	}

	return true;
}

function createCry(roomName) {
	//initialize the cry object in memory
	Memory._cries = _.merge([], Memory._cries);

	if (Memory._cries.indexOf(roomName) == -1) {
		Memory._cries.push(roomName);
	}
}

function deleteCry(roomName) {
	//initialize the cry object in memory
	Memory._cries = _.merge([], Memory._cries);

	if (Memory._cries.indexOf(roomName) != -1) {
		Memory._cries = Memory._cries.filter(cry => cry != roomName);
	}
}

function findClosestCryTo(targetRoomName) {
	//initialize the cry object in memory
	Memory._cries = _.merge([], Memory._cries);

	if (Memory._cries.length == 0) {
		return null;
	}

	const distances = Memory._cries.map(cry => {
		return { roomName: cry, distance: Game.map.getRoomLinearDistance(cry, targetRoomName) }
	});

	//minBy is missing...
	let closest;

	distances.forEach(distance => {
		if (!closest || closest.distance > distance.distance) {
			closest = distance;
		}
	});

	return closest.roomName;
}

module.exports = {
	init: c => null, //DO NOTHING
	run,
	createCry,
	deleteCry,
	findClosestCryTo,
};
