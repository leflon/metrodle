import { Database } from 'bun:sqlite';
import { plainify } from './utils';
import type { Completion } from './models/completion.model';
import type { Stop } from '$lib/models/stop.model';
import type { Line } from '$lib/models/line.model';

export const db = new Database('data/idfm.db', { create: true });
db.exec('PRAGMA journal_mode = WAL');


export function getRandomStop(types: string[]): { id: string } {
	const query = db.prepare('SELECT s.id FROM Stops s JOIN StopLines sl' +
		' ON' +
		` sl.stop_id = s.id JOIN Lines l ON l.id = sl.line_id WHERE l.type IN (${types.map(() => '?').join(',')})` +
		' ORDER BY RANDOM() LIMIT 1'
	);
	const res = query.get(...types);
	return res as { id: string };
}

const completionsQuery = db.prepare(
	'SELECT id, name, plain_name FROM Stops WHERE plain_name LIKE ? OR plain_name LIKE ? LIMIT 5'
);

export function getCompletions(input: string): Completion[] {
	input = plainify(input);
	return completionsQuery.all(`${input}%`, `%${input}%`) as Completion[];
}

const fullStopQuery = db.prepare('SELECT * FROM Stops WHERE id = ?');
const stopLinesQuery = db.prepare(
	'SELECT * FROM Lines WHERE id IN (SELECT line_id FROM StopLines WHERE stop_id = ?)'
);

export function getStopData(id: string): { stop: Stop; lines: Line[] } | null {
	const stop: Stop = fullStopQuery.get(id) as Stop;
	if (!stop) {
		return null;
	}
	const lines = stopLinesQuery.all(id) as Line[];
	return {
		stop,
		lines
	};
}

