import { getCompletions } from '$lib/db.js';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const input = url.searchParams.get('input');

	if (!input) {
		return json({ error: 'Missing input query parameter' }, { status: 400 });
	}
	const completions = getCompletions(input);
	return json({ completions });
}