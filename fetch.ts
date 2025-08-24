import Database from 'better-sqlite3';
import { createReadStream, statSync, writeFileSync } from 'fs';
import { plainify } from './src/lib/utils.ts';

const db = new Database('data/idfm.db');
db.exec('PRAGMA journal_mode = WAL');

/* Datasets */
const STOPS_URL =
	'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/emplacement-des-gares-idf-data-generalisee/exports/json';
const LINES_URL =
	'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes/exports/json';
const STOP_DETAILS_URL =
	'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/arrets/exports/json';
const MAP_URL =
	'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-du-reseau-ferre-idf/exports/geojson';

/* CLI flags */
const LOAD_LOCAL = process.argv.includes('--local'); // Load from local save rather than distant dataset
const WIPE_CURRENT = process.argv.includes('--wipe'); // Wipe existing database

console.log('== Initializing database ==');
if (WIPE_CURRENT) {
	db.exec('DROP TABLE IF EXISTS StopModes');
	db.exec('DROP TABLE IF EXISTS Stops');
	db.exec('DROP TABLE IF EXISTS Lines');
}
db.exec(
	'CREATE TABLE IF NOT EXISTS Stops(id TEXT PRIMARY KEY, name TEXT, plain_name TEXT, lines TEXT, town TEXT, fare_zone TEXT, geo TEXT)'
);
db.exec(
	'CREATE TABLE IF NOT EXISTS Lines(name TEXT PRIMARY KEY, mode TEXT, picto TEXT, color TEXT, text_color)'
);
// Storing modes (metro, rer, etc.) in a separate table allows to filter stations by mode efficiently.
db.exec('CREATE TABLE IF NOT EXISTS StopModes(stop_id TEXT, mode TEXT)');
db.exec('CREATE INDEX IF NOT EXISTS idx_stops_plain_name ON Stops(plain_name)'); // For search lookup
db.exec('CREATE INDEX IF NOT EXISTS idx_stop_modes ON StopModes(mode)'); // For filtering

console.log('== Fetching data ==');
type Datapoint = Record<string, string | Object | number>;
type Dataset = Datapoint[];
let stops: Dataset, lines: Dataset, stopDetails: Dataset, map: Dataset;

/**
 * Fetches data from a URL or local file with a progress indicator.
 * @param url The URL or local file path.
 * @returns The parsed JSON data.
 */
const fetchWithProgress = async (url: string): Promise<Dataset> => {
	let chunks: (Buffer | Uint8Array)[] = [];
	let receivedLength = 0;
	let contentSize = 0;

	if (url.startsWith('http')) {
		const response = await fetch(url);
		const reader = response.body!.getReader();
		contentSize = Number(response.headers.get('Content-Length')) || 0;

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
				chunks.push(chunk as Buffer);
				receivedLength += chunk.length;
				process.stdout.write(
					`\rReceived ${(receivedLength / (1024 * 1024)).toFixed(2)} MB${contentSize === 0 ? '' : ` of ${(contentSize / (1024 * 1024)).toFixed(2)} MB`}`
				);
			});
			stream.on('end', () => {
				resolve(void 0); // cool
			});
			stream.on('error', (err) => {
				reject(err);
			});
		});
	}

	const chunksAll = Buffer.concat(chunks as any);
	const result = chunksAll.toString('utf-8');
	console.log();
	return JSON.parse(result);
};

console.log('Fetching stops...');
stops = await fetchWithProgress(LOAD_LOCAL ? 'data/stops.json' : STOPS_URL);
console.log('Fetching lines...');
lines = await fetchWithProgress(LOAD_LOCAL ? 'data/lines.json' : LINES_URL);
console.log('Fetching stop details...');
stopDetails = await fetchWithProgress(LOAD_LOCAL ? 'data/stop_details.json' : STOP_DETAILS_URL);

if (!LOAD_LOCAL) {
	writeFileSync('data/stops.json', JSON.stringify(stops));
	writeFileSync('data/lines.json', JSON.stringify(lines));
	writeFileSync('data/stop_details.json', JSON.stringify(stopDetails));
	// This dataset is not to be stored in database, we only need the JSON file.
	console.log('Fetching map...');
	map = await fetchWithProgress(MAP_URL);
	writeFileSync('data/map.json', JSON.stringify(map));
}

console.log('== Formatting and saving... (Might take some time)');

const insertStop = db.prepare('INSERT OR IGNORE INTO Stops VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertStopMode = db.prepare('INSERT OR IGNORE INTO StopModes VALUES (?, ?)');
const insertLine = db.prepare('INSERT OR IGNORE INTO Lines VALUES(?, ?, ?, ?, ?)');

const LINES_REGEX = /(\w+) (\w+)(?: \/)?/gi;
/**
 * Parses lines names from dataset
 * @param linesString The raw `res_com` provided by IDFM
 */
function parseLines(linesString: string): string[] {
	let result: string[] = [];
	let parsed: RegExpExecArray | null;
	while ((parsed = LINES_REGEX.exec(linesString)) !== null) {
		let line = parsed[2];
		if (parsed[1] === 'TRAM') line = `T${line}`;
		if (line.includes('bis')) line = line.replace('bis', 'B');
		if (line.includes('MONTMARTRE')) line = 'FUNICULAIRE';
		line.replaceAll(' ', '');
		result.push(line);
	}
	if (result.length === 0) result = [linesString];
	return result;
}

/**
 * Parses mode from string, taking care of edge cases.
 * @param mode the raw mode provided by IDFM
 */
function parseMode(mode: string): string {
	mode = mode.toLowerCase();
	if (mode === 'funicular') mode = 'metro'; // including funicular in metro to include it in games as *somewhat* an easter egg.
	if (mode === 'rail' || mode === 'transilien' || mode === 'val') mode = 'train';
	if (mode === 'tramway') mode = 'tram';
	return mode;
}

const insertData = db.transaction((stops) => {
	stops.map((stop: Datapoint) => {
		let details = stopDetails.find(
			(s) => s.zdaid === String(stop.id_ref_zda) && s.arrfarezone !== null
		);
		if (!details) {
			// Stop is out of Ile-de-France, fetch without farezone constraint
			// and set it manually.
			details = stopDetails.find((s) => s.zdaid === String(stop.id_ref_zda));
			if (!details) return console.log('No details for', stop.nom_zda, stop.res_com);
			details.arrfarezone = 'Hors IDF';
		}
		if (stop.res_com === 'TER') return; // Ignoring TER-only stops
		const plainName = plainify(stop.nom_long as string);
		const stopLines = parseLines(stop.res_com as string);
		const modes = stop.mode as string;
		const geo = `${(stop.geo_point_2d as any).lon},${(stop.geo_point_2d as any).lat}`;
		insertStop.run(
			String(stop.id_ref_zda),
			stop.nom_long,
			plainName,
			stopLines.join(','),
			details.arrtown,
			details.arrfarezone,
			geo
		);

		for (const mode of modes.split(' / ')) {
			insertStopMode.run(String(stop.id_ref_zda), parseMode(mode));
		}

		for (const id of (stop.idrefligc as string).split(' / ')) {
			const line = lines.find((l) => l.id_line === id);
			if (!line) continue;
			let mode = line.networkname ? (line.networkname as string) : (line.transportmode as string);
			mode = parseMode(mode);
			insertLine.run(
				(line.name_line as string).replaceAll(' ', ''),
				mode,
				(line.picto as any)?.url,
				line.colourweb_hexa,
				line.textcolourweb_hexa
			);
		}
	});
});

insertData(stops);

console.log('Done');
