import Database from 'better-sqlite3';
import { plainify } from './utils';
import type { Completion } from './models/completion.model';
import type { Stop } from '$lib/models/stop.model';
import type { Line } from '$lib/models/line.model';

export const db = new Database('data/idfm.db');
db.exec('PRAGMA journal_mode = WAL');

export function getRandomStop(modes: string[]): { id: string } {
	const query = db.prepare(
		`SELECT s.id FROM Stops s
		  JOIN StopModes
		  m ON s.id = m.stop_id
			WHERE m.mode in (${modes.map(() => '?').join(',')})
			ORDER BY RANDOM()
			LIMIT 1`
	);
	const res = query.get(...modes);
	return res as { id: string };
}

const completionsQuery = db.prepare(
	'SELECT id, name, plain_name FROM Stops WHERE plain_name LIKE ? OR plain_name LIKE ? LIMIT 10'
);

export function getCompletions(input: string): Completion[] {
	input = plainify(input);
	return completionsQuery.all(`${input}%`, `%${input}%`) as Completion[];
}

const fullStopQuery = db.prepare('SELECT * FROM Stops WHERE id = ?');
const linesQuery = db.prepare('SELECT * FROM Lines WHERE name = ?');

export function getStopData(id: string): { stop: Stop; lines: Line[] } | null {
	const stop: Stop = fullStopQuery.get(id) as Stop;
	if (!stop) {
		return null;
	}
	stop.lines = (stop.lines as any as string).split(',');

	const lines: Line[] = [];
	for (const lineName of stop.lines) {
		const line = linesQuery.get(lineName) as Line;
		lines.push(line);
	}
	return {
		stop,
		lines
	};
}
