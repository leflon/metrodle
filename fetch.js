// This script fetches and formats metro stops data.
import { Database } from 'bun:sqlite';
const db = new Database('data/idfm.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');
console.log('Initializing database');
await db.run(
	`CREATE TABLE IF NOT EXISTS Lines(id TEXT PRIMARY KEY, name TEXT, type TEXT, operator TEXT, color TEXT, textColor TEXT, picto TEXT)`
);
await db.run(
	`CREATE TABLE IF NOT EXISTS Stops(id TEXT PRIMARY KEY, name TEXT, town TEXT, fare_zone TEXT, geo TEXT)`
);
await db.run(
	`CREATE TABLE IF NOT EXISTS StopLines(stop_id TEXT, line_id TEXT, PRIMARY KEY(stop_id, line_id), FOREIGN KEY(stop_id) REFERENCES Stops(id), FOREIGN KEY(line_id) REFERENCES Lines(id))`
);
await db.run(`CREATE INDEX IF NOT EXISTS idx_stops_name ON Stops(name)`);

console.log('====================');
console.log('    Fetching data');
console.log('====================');
const fetchWithProgress = async (url) => {
	let reader;
	let contentSize;
	if (url.startsWith('http')) {
		const response = await fetch(url);
		reader = response.body.getReader();
		contentSize = +response.headers.get('Content-Length');
	} else {
		const file = Bun.file(url);
		contentSize = file.size;
		reader = file.stream().getReader();
	}
	let receivedLength = 0;
	const chunks = [];
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

	const chunksAll = new Uint8Array(receivedLength);
	let position = 0;
	for (let chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}
	const result = new TextDecoder('utf-8').decode(chunksAll);
	console.log();
	return JSON.parse(result);
};

const LOAD_LOCAL = true;

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
	Bun.write('data/stops.json', JSON.stringify(stops, null, 2));
	Bun.write('data/stops-lines.json', JSON.stringify(stopsLines, null, 2));
	Bun.write('data/lines.json', JSON.stringify(lines, null, 2));
}
console.log('Formatting & saving data');
const insertStop = db.query('INSERT OR IGNORE INTO Stops VALUES(?, ?, ?, ?, ?)');
const insertLine = db.query('INSERT OR IGNORE INTO Lines VALUES(?, ?, ?, ?, ?, ?, ?)');
const insertStopLine = db.query('INSERT OR IGNORE INTO StopLines VALUES(?, ?)');
const lookup = db.query('SELECT * FROM Stops WHERE name = ? AND town = ?');

const interest = stops.filter((stop) => stop.arrtype !== 'bus');
const n = interest.length;
// Ignoring Bus stops, this would make the game far too difficult and not fun.
interest.map((stop, i) => {
	const stopLine = stopsLines.find(
		(s) =>
			s.stop_id.split(':').reverse()[0] === stop.arrid ||
			s.stop_id.split(':').reverse()[0] === stop.zdaid
	);
	if (stop.arrtown.startsWith('Paris')) // We don't want to have district information.
		stop.arrtown = 'Paris';
	if (!stopLine) return;
	const line = lines.find((l) => l.id_line === stopLine.id.split('IDFM:')[1]);
	if (!line) return;
	// We ignore TER lines.
	if (line.shortname_line === 'TER') return;
	//process.stdout.write(`\r${i + 1}/${n} (${line.shortname_line} - ${stop.arrname})`);
	// Checking tram type by line name since some lines are under the Transilien network.
	const tramTest = /T\d{1,2}[a|b|c]?/g; // T1c is a potential future line.
	insertLine.run([
		line.id_line,
		line.name_line,
		tramTest.test(line.name_line)
			? 'tram'
			: line.networkname === 'RER' || line.networkname === 'Transilien'
				? line.networkname
				: line.transportmode,
		line.operatorname.startsWith('RD ') ? 'RATP Cap' : line.operatorname,
		line.colourweb_hexa,
		line.textcolourweb_hexa,
		line.picto?.url
	]);
	const res = lookup.get([stop.arrname, stop.arrtown]);
	if (res) {
		console.log(res);
		insertStopLine.run([res.id, line.id_line]);
	} else {
		insertStop.run([
			stop.zdaid,
			stop.arrname,
			stop.arrtown,
			stop.arrfarezone,
			`${stop.arrgeopoint.lon}, ${stop.arrgeopoint.lat}`
		]);
		insertStopLine.run([stop.zdaid, line.id_line]);
	}
});
