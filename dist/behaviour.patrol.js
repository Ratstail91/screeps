const { PATROL: BEHAVIOUR_NAME } = require('behaviour_names');

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
	if (!creep.memory[BEHAVIOUR_NAME]) {
		creep.memory[BEHAVIOUR_NAME] = {
			targetCounter: 0,
			targetFlags: null,
			lastPath: null,
			lastPathTime: null
		};
	}

	//get the flag || undefined
	const targetCounter = creep.memory[BEHAVIOUR_NAME].targetCounter;
	const targetFlagName = creep.memory[BEHAVIOUR_NAME].targetFlags[targetCounter];
	const targetFlag = Game.flags[targetFlagName];

	//if targetFlag is null: fallthrough
	if (!targetFlag) {
		creep.memory[BEHAVIOUR_NAME].targetCounter = 0; //just in case
		return true;
	}

	//create a new path if: no path || path length is 0 || path timed out
	if (!creep.memory[BEHAVIOUR_NAME].lastPath || creep.memory[BEHAVIOUR_NAME].lastPath.length == 0 || creep.memory[BEHAVIOUR_NAME].lastPathTime + REUSE_PATH <= Game.time) {
		creep.memory[BEHAVIOUR_NAME].lastPath = creep.pos.findPathTo(targetFlag);
		creep.memory[BEHAVIOUR_NAME].lastPathTime = Game.time;
	}

	//move & draw the line manually (to save rebuilding the path)
	creep.room.visual.poly(creep.memory[BEHAVIOUR_NAME].lastPath, pathStyle);
	const moveResult = creep.moveByPath(creep.memory[BEHAVIOUR_NAME].lastPath);
	creep.memory[BEHAVIOUR_NAME].lastPath.shift(); //remove one for poly

	//handle the result
	if (moveResult == OK) {
		//if at the target flag: increment the target
		if (creep.pos.getRangeTo(targetFlag) == 0) {
			creep.memory[BEHAVIOUR_NAME].targetCounter++;
			if (creep.memory[BEHAVIOUR_NAME].targetCounter >= creep.memory[BEHAVIOUR_NAME].targetFlags.length) {
				creep.memory[BEHAVIOUR_NAME].targetCounter = 0;
			}

			//set the path to null to rebuild it next tick
			creep.memory[BEHAVIOUR_NAME].lastPath = null;
			creep.memory[BEHAVIOUR_NAME].lastPathTime = null;
		}

		//DO NOTHING (else)
		return false;
	} else if (moveResult == ERR_NOT_FOUND) {
		//set the path to null to rebuild it next tick (blocked by another creep?)
		creep.memory[BEHAVIOUR_NAME].lastPath = null;
		creep.memory[BEHAVIOUR_NAME].lastPathTime = null;

		//if at the target flag: increment the target
		if (creep.pos.getRangeTo(targetFlag) == 0) {
			creep.memory[BEHAVIOUR_NAME].targetCounter++;
			if (creep.memory[BEHAVIOUR_NAME].targetCounter >= creep.memory[BEHAVIOUR_NAME].targetFlags.length) {
				creep.memory[BEHAVIOUR_NAME].targetCounter = 0;
			}
		}

		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
}

module.exports = run;
