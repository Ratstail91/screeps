const { BRAVE: BEHAVIOUR_NAME } = require('behaviour_names');

const pathStyle = { stroke: '#ff0000', opacity: 0.8 };

function attackHostileCreeps(creep, filter) {
	const iAmRanged = creep.getActiveBodyparts(RANGED_ATTACK) > 0;

	//handle hostiles based on a filter
	const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS)
		.filter(c => c.pos.x > 0 && c.pos.x < 49 && c.pos.y > 0 && c.pos.y < 49)
	;

	const closestHostile = creep.pos.findClosestByPath(hostileCreeps, { filter: filter });

	if (closestHostile) {
		const attackResult = iAmRanged ? creep.rangedAttack(closestHostile) : creep.attack(closestHostile);

		if (attackResult == OK || attackResult == ERR_NO_BODYPART) {
			//DO NOTHING
		} else if (attackResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(closestHostile, { reusePath: 1, visualizePathStyle: pathStyle });
		} else {
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: iAmRanged ${iAmRanged} attackResult ${attackResult} closestHostile ${JSON.stringify(closestHostile)}`);
		}

		return false;
	}

	return true;
}

function run(creep) {
	return (
		attackHostileCreeps(creep, (hostile) => hostile.getActiveBodyparts(HEAL) > 0) &&
		attackHostileCreeps(creep, (hostile) => hostile.getActiveBodyparts(ATTACK) + hostile.getActiveBodyparts(RANGED_ATTACK) > 0) &&
		attackHostileCreeps(creep, (hostile) => true)
	);
}

module.exports = run;