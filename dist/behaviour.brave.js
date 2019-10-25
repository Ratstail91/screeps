const { BRAVE: BEHAVIOUR_NAME } = require('behaviour_names');

const allies = require("allies");

const pathStyle = { stroke: '#ff0000', opacity: 0.8 };

function attackHostileCreeps(creep, filter) {
	const iAmRanged = creep.getActiveBodyparts(RANGED_ATTACK) > 0;

	//handle hostiles based on a filter
	const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS)
		.filter(c => c.pos.x > 0 && c.pos.x < 49 && c.pos.y > 0 && c.pos.y < 49)
		.filter(c => allies.indexOf(c.owner.username) == -1) //NOTE: untested
	;

	let closestHostile = creep.pos.findClosestByRange(hostileCreeps, { filter: filter });

	if (!closestHostile) {
		closestHostile = creep.pos.findClosestByRange(creep.room.find(FIND_HOSTILE_STRUCTURES, {
			filter: s => s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_POWER_BANK && s.structureType != STRUCTURE_POWER_SPAWN && allies.indexOf(s.owner.username) == -1
		}));
	}

	if (closestHostile) {
		const attackResult = iAmRanged ? creep.rangedAttack(closestHostile) : creep.attack(closestHostile);

		switch(attackResult) {
			case OK:
				return false;

			case ERR_NO_BODYPART:
				return true;

			case ERR_NOT_IN_RANGE:
				//if damaged and far away from a target
		//		if (creep.hits < creep.hitsMax) {
		//			return true;
		//		}

				const moveResult = creep.moveTo(closestHostile, { reusePath: 1, visualizePathStyle: pathStyle });

				switch(moveResult) {
					case OK:
						return false;

					case ERR_TIRED:
					case ERR_NO_BODYPART:
						return true;

					default:
						throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: moveResult ${moveResult}`);
				}

			default:
				throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: iAmRanged ${iAmRanged} attackResult ${attackResult} closestHostile ${JSON.stringify(closestHostile)}`);
		}
	}

	return true;
}

function run(creep) {
	return (
		attackHostileCreeps(creep, (hostile) => hostile.getActiveBodyparts(ATTACK) + hostile.getActiveBodyparts(RANGED_ATTACK) > 0) &&
		attackHostileCreeps(creep, (hostile) => hostile.getActiveBodyparts(HEAL) > 0) &&
		attackHostileCreeps(creep, (hostile) => true)
	);
}

const profiler = require('screepers.profiler');

module.exports = profiler.registerFN(run, "brave.run");
