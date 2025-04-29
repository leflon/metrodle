import { json, type RequestHandler } from '@sveltejs/kit';
import { getRandomStop } from '$lib/db';

export const GET: RequestHandler = async ({url}) => {
	const types = url.searchParams.get('types') || 'metro'
	const arr = types.split(',');
	const station = getRandomStop(arr);
	return json(station);
};