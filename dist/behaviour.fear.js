const { FEAR: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function serialize(func) {
	return func.toString().replace(/[\t\n\r]/g, '');
}

function deserialize(str) {
	return new Function('return ' + str)();
}

function run(creep) {
	//initialize new creeps
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		returnHome: false,
		onSafe: '(creep) => null',
		_runningHome: false,
		_sawLastTick: false
	}, creep.memory[BEHAVIOUR_NAME]);

	const originSpawn = Game.spawns[creep.memory.origin];

	//if you're running home
	if (creep.memory[BEHAVIOUR_NAME]._runningHome) {
		//if you've reached home room
		if (creep.pos.getRangeTo(originSpawn) != Infinity) {
			creep.memory[BEHAVIOUR_NAME]._runningHome = false;
			//if you're safe, call onSafe
			if (creep.room.find(FIND_HOSTILE_CREEPS).length == 0 && creep.memory[BEHAVIOUR_NAME].onSafe) {
				deserialize(creep.memory[BEHAVIOUR_NAME].onSafe)(creep);
			}
		}
		creep.moveTo(originSpawn, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle }); //last, to step off the exit too
		return false;
	}

	let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

	//nothing found, fall through
	if (hostiles.length == 0) {
		//if saw last tick (moved into new room?)
		if (creep.memory[BEHAVIOUR_NAME]._sawLastTick) {
			if (creep.memory[BEHAVIOUR_NAME].onSafe) {
				deserialize(creep.memory[BEHAVIOUR_NAME].onSafe)(creep);
			}
			creep.memory[BEHAVIOUR_NAME]._sawLastTick = false;
		}
		return true;
	}

	creep.memory[BEHAVIOUR_NAME]._sawLastTick = true;

	//switch on running if enabled
	if (creep.memory[BEHAVIOUR_NAME].returnHome) {
		creep.memory[BEHAVIOUR_NAME]._runningHome = true;
	}

	//run towards home
	creep.moveTo(originSpawn, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle });

	//no fall through
	return false;
}

module.exports = {
	run: run,
	serialize: serialize,
	deserialize: deserialize
};