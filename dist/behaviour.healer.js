/* DOCS: healer behaviour
 * This behaviour will find nearby creeps to heal, including itself.
*/

const { HEAL: BEHAVIOUR_NAME } = require("behaviour_names");

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#0000ff' };

/* DOCS: run(creep)
 * Run healer behaviour for "creep".
*/
function run(creep) {
	//don't stand on the doorway!
	if (creep.pos.x <= 0 || creep.pos.y <= 0 || creep.pos.x >= 49 || creep.pos.y >= 49) {
		return true;
	}

	//find damaged creeps
	const closest = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax });

	if (!closest) {
		return true;
	}

//	console.log(`closest to ${creep.name}: ${closest}`);

	const healResult = creep.heal(closest);

	switch(healResult) {
		case OK:
			//DO NOTHING
			return false;

		case ERR_NOT_IN_RANGE:
			const rangedHealResult = creep.rangedHeal(closest);

			if (rangedHealResult == ERR_NOT_IN_RANGE) {
				creep.moveTo(closest, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle, range: 3 });
			}
			return false;

		case ERR_INVALID_TARGET:
			console.log("ERR: invalid target");
			console.log(closest);
			return true;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: healResult ${healResult}`);
	}
}

module.exports = run;