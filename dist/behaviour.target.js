const { TARGET: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = {
	fill: 'transparent',
	stroke: '#ff00ff',
	lineStyle: 'dashed',
	strokeWidth: .15,
	opacity: .1
};

function run(creep) {
	//initialize new creeps
	if (!creep.memory[BEHAVIOUR_NAME]) {
		creep.memory[BEHAVIOUR_NAME] = {
			targetFlag: null,
			lastPath: null,
			lastPathTime: null
		};
	}

	//get the flag || undefined
	const flag = Game.flags[creep.memory[BEHAVIOUR_NAME].targetFlag];

	//fall through if no flag set || at flag
	if (!flag || creep.pos.getRangeTo(flag) == 0) {
		creep.memory[BEHAVIOUR_NAME].lastPath = null;
		creep.memory[BEHAVIOUR_NAME].lastPathTime = null;
		return true;
	}

	//create a new path if: range > 0 && (no path || flag moved (using x & y because getRangeTo is dumb) || time to refresh path)
	if (creep.pos.getRangeTo(flag) > 0 && (!creep.memory[BEHAVIOUR_NAME].lastPath || flag.pos.getRangeTo(creep.memory[BEHAVIOUR_NAME].lastPath[creep.memory[BEHAVIOUR_NAME].lastPath.length-1].x, creep.memory[BEHAVIOUR_NAME].lastPath[creep.memory[BEHAVIOUR_NAME].lastPath.length-1].y) > 0 || creep.memory[BEHAVIOUR_NAME].lastPathTime + REUSE_PATH <= Game.time)) {
		creep.memory[BEHAVIOUR_NAME].lastPath = creep.pos.findPathTo(Game.flags[creep.memory[BEHAVIOUR_NAME].targetFlag]);
		creep.memory[BEHAVIOUR_NAME].lastPathTime = Game.time;
	}

	//move & draw the line manually (to save rebuilding the path)
	creep.room.visual.poly(creep.memory[BEHAVIOUR_NAME].lastPath, pathStyle);
	const moveResult = creep.moveByPath(creep.memory[BEHAVIOUR_NAME].lastPath);
	creep.memory[BEHAVIOUR_NAME].lastPath.shift(); //remove one for poly

	//handle the result
	if (moveResult == OK) {
		//DO NOTHING
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
}

module.exports = run;
