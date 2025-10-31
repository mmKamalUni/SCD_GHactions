const satellite = require("./src/satellite");
const _iridium = require("./src/iridium");

var _location = [39.9042, 116.4074, "%E5%8C%97%E4%BA%AC%E5%B8%82", 52, "ChST"];
// COOKIE需要先通过浏览器调到中文

// expose a function that runs the scrape and returns a Promise
function runScrape() {
	// currently the original script only calls satellite.getTable for the ISS
	return satellite.getTable({
		target: 25544,
		pages: 4,
		root: "./public/data/"
	});
}

// If invoked directly, run and log progress
if (require.main === module) {
	runScrape().then(database => {
		console.log("Scrape completed. Items:", Array.isArray(database) ? database.length : 0);
	}).catch(err => {
		console.error("Scrape failed:", err);
		process.exit(1);
	});
}

module.exports = { runScrape };
