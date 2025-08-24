import * as turf from '@turf/turf';
import { json, type RequestHandler } from '@sveltejs/kit';
import FEATURES from '../../../../data/map.json';
import { getStopData } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
	const stop = url.searchParams.get('stop');
	if (!stop) return json({ error: 'Missing stop parameter' }, { status: 400 });
	const stopData = getStopData(stop);
	if (!stopData) return json({ error: 'Stop not found' }, { status: 404 });
	// Filter geojson features
	const split = stopData.stop.geo.split(',');
	const geoPoint = [parseFloat(split[0]), parseFloat(split[1])];
	const center = turf.point(geoPoint);
	const radius = 10; //km. Needs a big radius to allow for unzoom when game ends.
	const circle = turf.circle(center, radius, { steps: 64, units: 'kilometers' });
	// const filteredFeatures = turf.pointsWithinPolygon(FEATURES.features as any, circle);
	const filteredFeatures = FEATURES.features.filter((feature) => {
		return turf.booleanIntersects(feature as any, circle);
	});
	return json({
		features: filteredFeatures,
		center: geoPoint,
		isConnecting: stopData.lines.length > 1
	});
};
