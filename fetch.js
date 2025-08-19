// This script fetches and formats metro stops data using Node.js.
import Database from 'better-sqlite3';
import { createReadStream, writeFileSync, statSync } from 'fs';
import { PassThrough } from 'stream';

// Function to handle the top-level async logic
async function main() {
	const db = new Database('data/idfm.db');
	db.exec('PRAGMA journal_mode = WAL');

	const WIPE_DATA = process.argv.includes('--wipe') || process.argv.includes('-w');

	if (WIPE_DATA) {
		console.log('Deleting previous data.');
		db.exec('DROP TABLE IF EXISTS StopLines');
		db.exec('DROP TABLE IF EXISTS Stops');
		db.exec('DROP TABLE IF EXISTS Lines');
	}

	console.log('Initializing database');
	db.exec(
		`CREATE TABLE IF NOT EXISTS Lines(id TEXT PRIMARY KEY, name TEXT, type TEXT, operator TEXT, color TEXT, textColor TEXT, picto TEXT)`
	);
	db.exec(
		`CREATE TABLE IF NOT EXISTS Stops(id TEXT PRIMARY KEY, name TEXT, plain_name TEXT, town TEXT, fare_zone TEXT, geo TEXT)`
	);
	db.exec(
		`CREATE TABLE IF NOT EXISTS StopLines(stop_id TEXT, line_id TEXT, PRIMARY KEY(stop_id, line_id), FOREIGN KEY(stop_id) REFERENCES Stops(id), FOREIGN KEY(line_id) REFERENCES Lines(id))`
	);
	db.exec(`CREATE INDEX IF NOT EXISTS idx_stops_name ON Stops(name)`);

	console.log('====================');
	console.log('     Fetching data');
	console.log('====================');

	/**
	 * Fetches data from a URL or local file with a progress indicator.
	 * @param {string} url The URL or local file path.
	 * @returns {Promise<any>} The parsed JSON data.
	 */
	const fetchWithProgress = async (url) => {
		const chunks = [];
		let receivedLength = 0;
		let contentSize = 0;

		if (url.startsWith('http')) {
			// Using standard Node.js fetch which is available from v18+
			const response = await fetch(url);
			const reader = response.body.getReader();
			contentSize = +response.headers.get('Content-Length') || 0;

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				chunks.push(value);
				receivedLength += value.length;
				process.stdout.write(
					`\rReceived ${(receivedLength / (1024 * 1024)).toFixed(2)} MB${contentSize === 0 ? '' : ` of ${(contentSize / (1024 * 1024)).toFixed(2)} MB`}`
				);
			}
		} else {
			// Using a promise-based approach with Node.js streams for local files
			const stream = createReadStream(url);
			const { size } = statSync(url);
			contentSize = size;

			await new Promise((resolve, reject) => {
				stream.on('data', (chunk) => {
					chunks.push(chunk);
					receivedLength += chunk.length;
					process.stdout.write(
						`\rReceived ${(receivedLength / (1024 * 1024)).toFixed(2)} MB${contentSize === 0 ? '' : ` of ${(contentSize / (1024 * 1024)).toFixed(2)} MB`}`
					);
				});
				stream.on('end', () => {
					resolve();
				});
				stream.on('error', (err) => {
					reject(err);
				});
			});
		}

		const chunksAll = Buffer.concat(chunks);
		const result = chunksAll.toString('utf-8');
		console.log();
		return JSON.parse(result);
	};

	/**
	 * Removes accents and special characters from a string and converts to lowercase.
	 * Used for better search experience.
	 * @param {string} str The input string.
	 * @returns {string} The formatted string.
	 */
	function removeAccents(str) {
		return str
			.replace(/[ -']/g, '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}

	const LOAD_LOCAL = process.argv.includes('--local') || process.argv.includes('-l');
	if (LOAD_LOCAL) {
		console.log('Loading local data');
	} else {
		console.log('Loading from IDFM Open Data');
	}

	console.log('Fetching Arrêts et Lignes associées');
	const stopsLines = await fetchWithProgress(
		LOAD_LOCAL
			? 'data/stops-lines.json'
			: 'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/arrets-lignes/exports/json?lang=fr'
	);
	console.log('Fetching Référentiel des arrêts');
	const stops = await fetchWithProgress(
		LOAD_LOCAL
			? 'data/stops.json'
			: 'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/arrets/exports/json?lang=fr'
	);
	console.log('Fetching Lignes');
	const lines = await fetchWithProgress(
		LOAD_LOCAL
			? 'data/lines.json'
			: 'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/exports/json?lang=fr'
	);
	if (!LOAD_LOCAL) {
		// Saving newest version of data locally
		writeFileSync('data/stops.json', JSON.stringify(stops, null, 2));
		writeFileSync('data/stops-lines.json', JSON.stringify(stopsLines, null, 2));
		writeFileSync('data/lines.json', JSON.stringify(lines, null, 2));
	}
	console.log('Formatting & saving data');

	const insertStop = db.prepare('INSERT OR IGNORE INTO Stops VALUES(?, ?, ?, ?, ?, ?)');
	const insertLine = db.prepare('INSERT OR IGNORE INTO Lines VALUES(?, ?, ?, ?, ?, ?, ?)');
	const insertStopLine = db.prepare('INSERT OR IGNORE INTO StopLines VALUES(?, ?)');
	const lookup = db.prepare('SELECT * FROM Stops WHERE name = ? AND town = ?');

	const insertData = db.transaction((interest) => {
		interest.map((stop) => {
			const stopLine = stopsLines.find(
				(s) =>
					s.stop_id.split(':').reverse()[0] === stop.arrid ||
					s.stop_id.split(':').reverse()[0] === stop.zdaid
			);
			if (!stopLine) return;
			const line = lines.find((l) => l.id_line === stopLine.id.split('IDFM:')[1]);
			if (!line) return;
			// We ignore TER lines.
			if (line.shortname_line === 'TER') return;
			// Checking tram type by line name since some lines are under the Transilien brand.
			const tramTest = /T\d{1,2}[abc]?/g; // T1c is a potential future line.
			insertLine.run(
				line.id_line,
				line.name_line,
				tramTest.test(line.name_line)
					? 'tram'
					: line.networkname === 'RER' || line.networkname === 'Transilien'
						? line.networkname.toLowerCase()
						: line.transportmode.toLowerCase(),
				line.operatorname.startsWith('RD ') ? 'RATP Cap' : line.operatorname,
				line.colourweb_hexa,
				line.textcolourweb_hexa,
				line.picto?.url
			);
			const res = lookup.get(stop.arrname, stop.arrtown);
			if (res) {
				console.log('Match found, merging:', stop.arrname);
				insertStopLine.run(res.id, line.id_line);
			} else {
				insertStop.run(
					stop.zdaid,
					stop.arrname,
					removeAccents(stop.arrname),
					stop.arrtown,
					stop.arrfarezone,
					`${stop.arrgeopoint.lon}, ${stop.arrgeopoint.lat}`
				);
				insertStopLine.run(stop.zdaid, line.id_line);
			}
		});
	});

	// Ignoring Bus stops, this would make the game far too difficult and not fun.
	const interest = stops.filter((stop) => stop.arrtype !== 'bus');
	insertData(interest);

	console.log('Done!');
}

main().catch(console.error);
