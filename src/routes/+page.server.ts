import { getRandomStop } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const stop = getRandomStop();
	return {
		stop: stop.id,
	}
};