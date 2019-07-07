//spawn is a spawn point to build around
function autoBuild(spawn, ftag) {
	//one spawn can have multiple tagged building paths
	const entryName = `${spawn.name}${ftag}`;

	//initialize autoBuildLevels
	Memory.autoBuildLevels = Memory.autoBuildLevels || {};
	Memory.autoBuildLevels[entryName] = Memory.autoBuildLevels[entryName] + 0 || 0;

	//assume controller levels only go up
	if (spawn.room.controller.level <= Memory.autoBuildLevels[entryName]) {
		return;
	}

	Memory.autoBuildLevels[entryName]++;

	//if not using ftag
	ftag = ftag || '';

	//build the filename
	const fname = `${ftag}${Memory.autoBuildLevels[entryName]}.autobuild`;

	//actually run the build function
	placeConstructionSites(spawn, require(fname));
}

//spawn is a spawn point to build around
//buildData is an array of objects: [{ x: number, y: number: structureType: number }]
function placeConstructionSites(spawn, buildData) {
	for (let i = 0; i < buildData.length; i++) {
		spawn.room.createConstructionSite(buildData[i].x + spawn.pos.x, buildData[i].y + spawn.pos.y, buildData[i].structureType);
	}
}

module.exports = {
	autoBuild: autoBuild,
	placeConstructionSites: placeConstructionSites
};

