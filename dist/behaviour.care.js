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

	//move to the target cry
	const targetPos = new RoomPosition(25, 25, targetCry);

	creep.moveTo(targetPos, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle, range: 15 });
	return false;
}

const profiler = require('screepers.profiler');

module.exports = profiler.registerFN(run, "care.run");
