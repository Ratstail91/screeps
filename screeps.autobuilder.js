//spawn is a spawn point to build around
function autoBuild(spawn, ftag) {
	//initialize autoBuildLevels
	Memory.autoBuildLevels = Memory.autoBuildLevels || {};
	Memory.autoBuildLevels[spawn.name] = Memory.autoBuildLevels[spawn.name] + 0 || 0;

	//assume controller levels only go up
	if (spawn.room.controller.level <= Memory.autoBuildLevels[spawn.name]) {
		return;
	}

	Memory.autoBuildLevels[spawn.name]++;

	//if not using ftag
	ftag = ftag || '';

	//build the filename
	const fname = `${ftag}${Memory.autoBuildLevels[spawn.name]}.autobuild`;

	//actually run the build function
	placeConstructionSites(spawn, require(fname));
}

//spawn is a spawn point to build around
//buildData is an array of objects: [{ x: number, y: number: structureType: number }]
function placeConstructionSites(spawn, buildData) {
	for (let i = 0; i < buildData.length; i++) {
		const debug = spawn.room.createConstructionSite(buildData[i].x + spawn.pos.x, buildData[i].y + spawn.pos.y, buildData[i].structureType);
		console.log('createConstructionSite returned', debug);
	}
}

module.exports = {
	autoBuild: autoBuild,
	placeConstructionSites: placeConstructionSites
};

