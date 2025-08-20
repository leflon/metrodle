import { json, type RequestHandler } from '@sveltejs/kit';
import { getStopData } from '$lib/db';
import type { Guess, GuessEntry } from '$lib/models/guess.model';
import { DISCORD_HOOK_URL } from '$env/static/private';

function getArrowEmojiFromAngle(angle: number): string {
	const directions = [
		{ emoji: '⬆️', from: 337.5, to: 22.5 },
		{ emoji: '↗️', from: 22.5, to: 67.5 },
		{ emoji: '➡️', from: 67.5, to: 112.5 },
		{ emoji: '↘️', from: 112.5, to: 157.5 },
		{ emoji: '⬇️', from: 157.5, to: 202.5 },
		{ emoji: '↙️', from: 202.5, to: 247.5 },
		{ emoji: '⬅️', from: 247.5, to: 292.5 },
		{ emoji: '↖️', from: 292.5, to: 337.5 }
	];

	for (const dir of directions) {
		if (dir.from > dir.to) {
			// Wrap-around case (e.g., 337.5 to 22.5)
			if (angle >= dir.from || angle < dir.to) {
				return dir.emoji;
			}
		} else {
			if (angle >= dir.from && angle < dir.to) {
				return dir.emoji;
			}
		}
	}

	// Fallback
	return '⬆️';
}

function formatGuessEntry(name: keyof Guess, entry: GuessEntry<unknown>): string {
	const formatting = {
		incorrect: '*',
		partial: '',
		correct: '**'
	};

	let value: string;

	if (name === 'lines') {
		const typed = entry.value as { name: string; picto: string }[];
		value = typed.map((v) => v.name).join(', ');
	} else if (name === 'distance') {
		const typed = entry.value as { angle: number; distance: number };
		value = `${getArrowEmojiFromAngle(typed.angle)} ${typed.distance.toFixed(0)}m`;
	} else {
		value = (entry.value as string | number).toString();
	}
	return `${formatting[entry.correct]}${value}${formatting[entry.correct]}`;
}

type Data = {
	toGuess: string;
	guesses: Guess[]; // Stop names
	userAction: 'reset' | 'finished' | 'leave';
	colineMode: boolean;
	showMap: boolean;
};

export const POST: RequestHandler = async ({ request }) => {
	if (!DISCORD_HOOK_URL) return json({ error: 'Could not send the game' }, { status: 500 });

	const data: Data = await request.json();
	if (data.guesses.length === 0)
		return json(
			{ success: true, message: 'Did not send game because it contained no guess.' },
			{ status: 200 }
		);

	let guessString = '';
	for (const g of data.guesses) {
		guessString += `${g.isCorrect ? '🟩' : '🟥'} `;
		guessString += formatGuessEntry('name', g.name);
		guessString += ' | ' + formatGuessEntry('lines', g.lines);
		guessString += ' | ' + formatGuessEntry('town', g.town);
		guessString += ' | ' + formatGuessEntry('zone', g.zone);
		guessString += ' | ' + formatGuessEntry('distance', g.distance);
		guessString += '\n';
	}

	const stopData = getStopData(data.toGuess)!;
	const statusPhrases = {
		reset: 'User reset this game',
		finished: 'User found the station',
		leave: 'User left the game'
	};
	let body = `**${statusPhrases[data.userAction]}**\n`;
	body += `**Coline mode**: ${data.colineMode ? 'Yes' : 'No'}\n`;
	body += `**Show map**: ${data.showMap ? 'Yes' : 'No'}\n\n`;
	body += `${guessString}\n`;
	body += `**Correct**: ${stopData.stop.name} (${stopData.lines.map((l) => l.name).join(', ')})`;
	const embed = {
		title: 'New Game!',
		description: body,
		color: 0x4cc0ae,
		footer: {
			text: 'Metrodle'
		},
		timestamp: new Date().toISOString()
	};
	try {
		await fetch(DISCORD_HOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				embeds: [embed]
			})
		});
		return json({ success: true });
	} catch (err) {
		return json({ error: err }, { status: 500 });
	}
};
