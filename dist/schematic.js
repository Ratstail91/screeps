/* DOCS: schematicBuild(point, filename)
 * "point" is a point around which to build
 * "filename" is the name of the JS file with the schematics to build
*/
function schematicBuild(point, filename) {
	if (!point.room || !point.pos) {
		throw new Error('Cannot build around point');
	}

	//TODO: a more robust autobuilder that handles controller levels, etc.

	//actually run the build function
	return placeConstructionSites(point, require(filename));
}

/* DOCS: placeConstructionSites(point, buildData)
 * "point" is a point around which to build
 * "buildData" is an array of objects: [{ x: number, y: number: structureType: number }]
*/
function placeConstructionSites(point, buildData) {
	let invalidPlacement = 0;

	for (let i = 0; i < buildData.length; i++) {
		let posX = buildData[i].x + point.pos.x;
		let posY = buildData[i].y + point.pos.y;

		let found = point.room.lookAt(posX, posY)
			.some(
				obj => obj.type == "constructionSite" ||
				(obj.type == "structure" && obj.structure.structureType == buildData[i].structureType)// ||
//				(obj.name != undefined && obj.name.startsWith('schematic.ignore')) //for flags
			)
		;

		//if this building has been found
		if (found) {
			continue;
		}

		let buildResult = point.room.createConstructionSite(posX, posY, buildData[i].structureType);

		switch(buildResult) {
			case OK:
				//do nothing
				break;

			case ERR_INVALID_TARGET:
				invalidPlacement++;
				break;

			case ERR_RCL_NOT_ENOUGH:
				return invalidPlacement;

			default:
				throw new Error(`Unknown state in placeConstructionSites for ${point.name}: buildResult ${buildResult} posX ${posX} posY ${posY}`);
		}
	}

	return invalidPlacement;
}

module.exports = {
	schematicBuild,
	placeConstructionSites
};
