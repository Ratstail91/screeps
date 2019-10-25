const { PATROL: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = {
	fill: 'transparent',
	stroke: '#ff00ff',
	lineStyle: 'dashed',
	strokeWidth: .15,
	opacity: .1
};

function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		stopInRoom: false,
		targetFlags: null,
		_targetCounter: 0,
		_lastPath: null,
		_lastPathTime: null
	}, creep.memory[BEHAVIOUR_NAME]);
}

function run(creep) {
	//NOTE: does not handle flags moving correctly, and pauses on the flags for a tick

	//get the flag || undefined
	const targetCounter = creep.memory[BEHAVIOUR_NAME]._targetCounter;
	const targetFlagName = creep.memory[BEHAVIOUR_NAME].targetFlags[targetCounter];
	const targetFlag = Game.flags[targetFlagName];

	//if targetFlag is null: fallthrough
	if (!targetFlag) {
		creep.memory[BEHAVIOUR_NAME]._targetCounter = 0; //just in case
		return true;
	}

	//create a new path if: no path || path length is 0 || path timed out
	if (!creep.memory[BEHAVIOUR_NAME]._lastPath || creep.memory[BEHAVIOUR_NAME]._lastPath.length == 0 || creep.memory[BEHAVIOUR_NAME]._lastPathTime + REUSE_PATH <= Game.time) {
		creep.memory[BEHAVIOUR_NAME]._lastPath = creep.pos.findPathTo(targetFlag);
		creep.memory[BEHAVIOUR_NAME]._lastPathTime = Game.time;
	}

	//move & draw the line manually (to save rebuilding the path)
	creep.room.visual.poly(creep.memory[BEHAVIOUR_NAME]._lastPath, pathStyle);
	const moveResult = creep.moveByPath(creep.memory[BEHAVIOUR_NAME]._lastPath);
	creep.memory[BEHAVIOUR_NAME]._lastPath.shift(); //remove one for poly

	//handle the result
	if (moveResult == OK || moveResult == ERR_TIRED) {
		//if at the target flag: increment the target (also works in the correct room)
		if (creep.pos.getRangeTo(targetFlag) == 0 || (creep.memory[BEHAVIOUR_NAME].stopInRoom && creep.pos.getRangeTo(targetFlag) != Infinity)) {
			creep.memory[BEHAVIOUR_NAME]._targetCounter++;
			if (creep.memory[BEHAVIOUR_NAME]._targetCounter >= creep.memory[BEHAVIOUR_NAME].targetFlags.length) {
				creep.memory[BEHAVIOUR_NAME]._targetCounter = 0;
			}

			//set the path to null to rebuild it next tick
			creep.memory[BEHAVIOUR_NAME]._lastPath = null;
			creep.memory[BEHAVIOUR_NAME]._lastPathTime = null;
		}

		//DO NOTHING (else)
		return false;
	} else if (moveResult == ERR_NOT_FOUND) {
		//set the path to null to rebuild it next tick (blocked by another creep?)
		creep.memory[BEHAVIOUR_NAME]._lastPath = null;
		creep.memory[BEHAVIOUR_NAME]._lastPathTime = null;

		//if at the target flag: increment the target
		if (creep.pos.getRangeTo(targetFlag) == 0) {
			creep.memory[BEHAVIOUR_NAME]._targetCounter++;
			if (creep.memory[BEHAVIOUR_NAME]._targetCounter >= creep.memory[BEHAVIOUR_NAME].targetFlags.length) {
				creep.memory[BEHAVIOUR_NAME]._targetCounter = 0;
			}
		}

		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
}

const profiler = require('screepers.profiler');

module.exports = {
	init: profiler.registerFN(init, "patrol.init"),
	run: profiler.registerFN(run, "patrol.run"),
};
