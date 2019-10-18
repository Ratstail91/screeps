const { CARE: BEHAVIOUR_NAME } = require('behaviour_names');

const { deleteCry, findClosestCryTo } = require('behaviour.cry');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	const targetCry = findClosestCryTo(creep.room.name);

	//no cries found
	if (!targetCry) {
		return true;
	}

	//found the cry
	if (targetCry == creep.room.name) {
		deleteCry(targetCry);
		return true;
	}

	//can't see this room, remove it
	if (!Game.rooms[targetCry]) {
		deleteCry(targetCry);
		return run(creep); //recursion FTW
	}

	//move to the target cry
	const targetPos = Game.rooms[targetCry].getPositionAt(25, 25);

	creep.moveTo(targetPos, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });
	return false;
}

module.exports = run;
