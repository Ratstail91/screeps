/* DOCS: This is a tool for sharing information between players, particularly
 * those belonging to the Toy Makers alliance.
*/

//error messages
const TELEPHONE_ERR_NOT_INITIALIZED = -101;
const TELEPHONE_ERR_WRONG_PLAYER = -102;
const TELEPHONE_ERR_WRONG_PROTOCOL = -103;
const TELEPHONE_ERR_PLAYER_NOT_CONNECTED = -104;
const TELEPHONE_ERR_NO_DATA = -105;

//protocols that can be used
const TELEPHONE_INFO = 99; //general data
const TELEPHONE_HELP = 98; //request help

//modes to use
const TELEPHONE_INFO_NONE = 0; //no info
const TELEPHONE_INFO_ANY = 1; //any information I want to send
const TELEPHONE_INFO_NOTIFY = 2; //invoke the other player's Game.notify()

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

//close down the telephone system
function closeTelephone() {
	RawMemory.setActiveSegments([]);
	RawMemory.setPublicSegments([]);
	RawMemory.setActiveForeignSegment(null);
}

//sending info or asking for help
function setTelephone(protocol, mode, data) {
	if (RawMemory.segments[protocol] == undefined) {
		return TELEPHONE_ERR_NOT_INITIALIZED;
	}

	RawMemory.segments[protocol] = encrypt({
		mode: mode,
		data: data,
	}, require("telephone.password"));

	return OK;
}

//receiving info
function requestTelephone(playerName, protocol) {
	RawMemory.setActiveForeignSegment(playerName, protocol);
}

//accessing info on the next tick
function getTelephone(playerName, protocol) {
	if (!RawMemory.foreignSegment) {
		return TELEPHONE_ERR_PLAYER_NOT_CONNECTED;
	}

	if (RawMemory.foreignSegment.username != playerName) {
		return TELEPHONE_ERR_WRONG_PLAYER;
	}

	if (RawMemory.foreignSegment.id != protocol) {
		return TELEPHONE_ERR_WRONG_PROTOCOL;
	}

	if (RawMemory.foreignSegment.data.length == 0) {
		return TELEPHONE_ERR_NO_DATA;
	}

	return decrypt(RawMemory.foreignSegment.data, require("telephone.password"));
}

//encrypt/decrypt functions built into the telephone system
function encrypt(content, passcode) {
	content = JSON.stringify(content);
	let result = [];
//console.log("encrypt: ", content.length, passcode);
	for(let i = 0; i < content.length; i++) {
		let passOffset = i % passcode.length;
		let calcAscii = (content.charCodeAt(i)+passcode.charCodeAt(passOffset));
		result.push(calcAscii);
	}

	return JSON.stringify(result);
}

function decrypt(content, passcode) {
	content = JSON.parse(content);
	let result = [];
	let str = '';
//console.log("decrypt: ", content, passcode);
	for(let i = 0; i < content.length; i++) {
		let passOffset = i % passcode.length;
		let calcAscii = (content[i] - passcode.charCodeAt(passOffset));
		result.push(calcAscii) ;
	}

	for(let i = 0; i < result.length; i++) {
		let ch = String.fromCharCode(result[i]);
		str += ch;
	}

	return str.length ? JSON.parse(str) : TELEPHONE_ERR_NO_DATA;
}

module.exports = {
	TELEPHONE_ERR_NOT_INITIALIZED,
	TELEPHONE_ERR_WRONG_PLAYER,
	TELEPHONE_ERR_WRONG_PROTOCOL,
	TELEPHONE_ERR_PLAYER_NOT_CONNECTED,
	TELEPHONE_ERR_NO_DATA,
	TELEPHONE_INFO,
	TELEPHONE_HELP,
	TELEPHONE_INFO_NONE,
	TELEPHONE_INFO_ANY,
	TELEPHONE_INFO_NOTIFY,
	TELEPHONE_HELP_NONE,
	TELEPHONE_HELP_ENERGY,
	TELEPHONE_HELP_DEFEND,
	TELEPHONE_HELP_ATTACK,
	initializeTelephone,
	closeTelephone,
	setTelephone,
	requestTelephone,
	getTelephone,
};
