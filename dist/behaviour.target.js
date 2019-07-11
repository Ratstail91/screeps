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
	//NOTE: does not handle flags moving correctly, and pauses on the flags for a tick

	//initialize new creeps
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		stopInRoom: false,
		targetFlag: null,
		_lastPath: null,
		_lastPathTime: null,
		_correctRoom: false
	}, creep.memory[BEHAVIOUR_NAME]);

	//get the flag || undefined
	const flag = Game.flags[creep.memory[BEHAVIOUR_NAME].targetFlag];

	//fall through if no flag set || at flag
	if (!flag || creep.pos.getRangeTo(flag) == 0) {
		creep.memory[BEHAVIOUR_NAME]._lastPath = null;
		creep.memory[BEHAVIOUR_NAME]._lastPathTime = null;
		return true;
	}

	//no longer correct room
	if (creep.memory[BEHAVIOUR_NAME]._correctRoom && creep.pos.getRangeTo(flag) == Infinity) {
		creep.memory[BEHAVIOUR_NAME]._correctRoom = false;
	}

	//stop if setting true && in the correct room (set elsewhere to allow stepping off of the entry)
	if (creep.memory[BEHAVIOUR_NAME].stopInRoom && creep.memory[BEHAVIOUR_NAME]._correctRoom) {
		return true;
	}

	//create a new path if: no path || path length is 0 || time to refresh path
	if (!creep.memory[BEHAVIOUR_NAME]._lastPath || creep.memory[BEHAVIOUR_NAME]._lastPath.length == 0 || creep.memory[BEHAVIOUR_NAME]._lastPathTime + REUSE_PATH <= Game.time) {
		creep.memory[BEHAVIOUR_NAME]._lastPath = creep.pos.findPathTo(Game.flags[creep.memory[BEHAVIOUR_NAME].targetFlag]);
		creep.memory[BEHAVIOUR_NAME]._lastPathTime = Game.time;
	}

	//move & draw the line manually (to save rebuilding the path)
	creep.room.visual.poly(creep.memory[BEHAVIOUR_NAME]._lastPath, pathStyle);
	const moveResult = creep.moveByPath(creep.memory[BEHAVIOUR_NAME]._lastPath);
	creep.memory[BEHAVIOUR_NAME]._lastPath.shift(); //remove one for poly

	//handle the result
	if (moveResult == OK) {
		//if using stopInRoom, set the flag to true when correct room found
		if (creep.memory[BEHAVIOUR_NAME].stopInRoom && creep.pos.getRangeTo(flag) != Infinity) {
			creep.memory[BEHAVIOUR_NAME]._correctRoom = true;
		}

		//DO NOTHING
		return false;
	} else if (moveResult == ERR_NOT_FOUND) {
		//set the path to null to rebuild it next tick (blocked by another creep?)
		creep.memory[BEHAVIOUR_NAME]._lastPath = null;
		creep.memory[BEHAVIOUR_NAME]._lastPathTime = null;

		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
}

module.exports = run;
