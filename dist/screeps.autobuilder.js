//point is an object to build around
function autoBuild(point, ftag) {
	if (!point.room || !point.pos || !point.name) {
		throw new Error('autoBuild cannot build around point');
	}

	//one point can have multiple tagged building paths
	const entryName = `${point.name}${ftag}`;

	//initialize autoBuildLevels
	Memory.autoBuildLevels = Memory.autoBuildLevels || {};
	Memory.autoBuildLevels[entryName] = Memory.autoBuildLevels[entryName] + 0 || 0;

	//assume controller levels only go up
	if (point.room.controller.level <= Memory.autoBuildLevels[entryName]) {
		return;
	}

	Memory.autoBuildLevels[entryName]++;

	//if not using ftag
	ftag = ftag || '';

	//build the filename
	const fname = `${ftag}${Memory.autoBuildLevels[entryName]}.autobuild`;

	//actually run the build function
	placeConstructionSites(point, require(fname));
}

//point is an object to build around
//buildData is an array of objects: [{ x: number, y: number: structureType: number }]
function placeConstructionSites(point, buildData) {
	if (!point.room || !point.pos) {
		throw new Error('placeConstructionSites cannot build around point');
	}

	for (let i = 0; i < buildData.length; i++) {
		point.room.createConstructionSite(buildData[i].x + point.pos.x, buildData[i].y + point.pos.y, buildData[i].structureType);
	}
}

module.exports = {
	autoBuild: autoBuild,
	placeConstructionSites: placeConstructionSites
};

