function createCry(roomName) {
	//initialize the cry object in memory
	Memory.cries = _.merge([], Memory.cries);

	if (Memory.cries.indexOf(roomName) == -1) {
		Memory.cries.push(roomName);
	}
}

function deleteCry(roomName) {
	//initialize the cry object in memory
	Memory.cries = _.merge([], Memory.cries);

	if (Memory.cries.indexOf(roomName) != -1) {
		Memory.cries = Memory.cries.filter(cry => cry != roomName);
	}
}

function findClosestCryTo(targetRoomName) {
	//initialize the cry object in memory
	Memory.cries = _.merge([], Memory.cries);

	if (Memory.cries.length == 0) {
		return null;
	}

	const distances = Memory.cries.map(cry => {
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
	createCry: createCry,
	deleteCry: deleteCry,
	findClosestCryTo: findClosestCryTo
};