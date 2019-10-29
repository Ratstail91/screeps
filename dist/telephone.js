/* DOCS: This is a tool for sharing information between players, particularly
 * those belonging to the Toy Makers alliance.
*/

//error messages
const TELEPHONE_ERR_NOT_INITIALIZED = -101;
const TELEPHONE_ERR_WRONG_PLAYER = -102;
const TELEPHONE_ERR_WRONG_PROTOCOL = -103;
const TELEPHONE_ERR_PLAYER_NOT_CONNECTED = -104;

//protocols that can be used
const TELEPHONE_INFO = 99; //general data
const TELEPHONE_HELP = 98; //request help

//modes to use
const TELEPHONE_INFO_ANY = 0; //any information I want to send

const TELEPHONE_HELP_NONE = 0; //I don't need help
const TELEPHONE_HELP_ENERGY = 1; //I need energy
const TELEPHONE_HELP_DEFEND = 2; //I need backup
const TELEPHONE_HELP_ATTACK = 3; //I need you to attack

//initialize the telephone system
function initializeTelephone() {
	const protocols = [
		TELEPHONE_INFO,
		TELEPHONE_HELP,
	];

	RawMemory.setActiveSegments(protocols);
	RawMemory.setPublicSegments(protocols);
}

function checkTelephone() {
	return RawMemory.segments[TELEPHONE_INFO] && RawMemory.segments[TELEPHONE_HELP];
}

//close down the telephone system
function closeTelephone() {
	RawMemory.setActiveSegments([]);
	RawMemory.setPublicSegments([]);
}

//sending info or asking for help
function setTelephone(protocol, mode, data) {
	if (!RawMemory.segments[protocol]) {
		return TELEPHONE_ERR_NOT_INITIALIZED;
	}

	RawMemory.segments[protocol] = JSON.stringify({
		mode: mode,
		data: data,
	});

	return OK;
}

//receiving info
function requestTelephone(playerName, protocol) {
	RawMemory.setActiveForeignSegment(playerName, protocol);
}

//accessing info on the next tick
function getTelephone(playerName, protocol) {
	if (RawMemory.foreignSegment.username != playerName) {
		return TELEPHONE_ERR_WRONG_PLAYER;
	}

	if (RawMemory.foreignSegment.id != protocol) {
		return TELEPHONE_ERR_WRONG_PROTOCOL;
	}

	if (!RawMemory.foreignSegment) {
		return TELEPHONE_ERR_PLAYER_NOT_CONNECTED;
	}

	return JSON.parse(RawMemory.foreignSegment);
}

module.exports = {
	TELEPHONE_ERR_NOT_INITIALIZED,
	TELEPHONE_ERR_WRONG_PLAYER,
	TELEPHONE_ERR_WRONG_PROTOCOL,
	TELEPHONE_ERR_PLAYER_NOT_CONNECTED,
	TELEPHONE_INFO,
	TELEPHONE_HELP,
	TELEPHONE_INFO_ANY,
	TELEPHONE_HELP_NONE,
	TELEPHONE_HELP_ENERGY,
	TELEPHONE_HELP_DEFEND,
	TELEPHONE_HELP_ATTACK,
	initializeTelephone,
	checkTelephone,
	closeTelephone,
	setTelephone,
	requestTelephone,
	getTelephone,
};
