import type { Guess } from '$lib/models/guess.model';
import type { Completion } from '$lib/models/completion.model';
import { storage } from '$lib/storage';
import { get } from 'svelte/store';

export async function getRandomStation(enabledTypes: Record<string, boolean>): Promise<string> {
	const query = new URLSearchParams();
	const typeString = Object.entries(enabledTypes).reduce(
		(acc, [index, val]) => acc + (val ? index + ',' : ''),
		''
	);
	query.set('types', typeString);
	const res = await fetch(`/api/random-station?${query.toString()}`);
	return (await res.json()).id;
}

export async function sendGuess(guess: string, correct: string): Promise<Guess> {
	const result = await fetch(`/api/guess?guess=${guess}&correct=${correct}`);
	return await result.json();
}

export async function getCompletions(input: string): Promise<Completion[]> {
	const result = await fetch(`/api/completions?input=${input}`);
	return (await result.json()).completions;
}

export async function getMinimapFeatures(
	stop: string
): Promise<{ center: [number, number]; features: any; isConnecting: boolean }> {
	const result = await fetch(`/api/minimap?stop=${stop}`);
	return await result.json();
}

export async function sendGame(
	guesses: Guess[],
	correct: string,
	action: 'finished' | 'reset' | 'leave' | 'forfeit'
): Promise<void> {
	const snapshot = get(storage);
	await fetch('/api/send-game', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			guesses,
			hardMode: snapshot.hardMode,
			showMap: snapshot.showMap,
			toGuess: correct,
			userAction: action
		})
	});
}
