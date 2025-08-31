<script lang="ts">
	import { getMinimapFeatures } from '$lib/api';
	import { storage } from '$lib/storage';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement;
	let map: L.Map;
	let geo: { features: any; center: [number, number]; isConnecting: boolean } | null = $state(null);

	type Props = {
		stop: string | null;
		unzoom: boolean;
	};
	let { stop, unzoom }: Props = $props();

	let showColors = $derived(!$storage.hardMode);

	$effect(() => {
		// Zooming out happens only when revealing the answer, and happens here.
		// Zooming back in is handled in drawMap. Doing it here as well conflicts with drawMap
		// and makes everything go bonkers. So far, restricing the unzoom feature to this unique
		// behavior is not a problem.
		if (!geo || !unzoom) return;
		map.setZoom(12);
	});

	const drawMap = async (colors: boolean) => {
		if (!geo) return;
		map.setView([geo.center[1], geo.center[0]], 16);
		// Removes the previously drawned elements from the map.
		map.eachLayer((layer) => {
			if (layer.getAttribution!() === 'Carto') return; // Avoids removing the map tiles layer.
			layer.remove();
		});
		L.geoJSON(geo.features, {
			style: (feature) => {
				const mode = feature?.properties.mode;
				return {
					// TER lines included in the GeoJSON dataset might appear over regular
					// lines, hiding their color.
					opacity: mode === 'TER' ? 0 : 1,
					weight: mode === 'METRO' || mode === 'TRAMWAY' ? 5 : 7, // thicker lines for heavy rail lines
					color: colors ? '#' + feature?.properties.colourweb_hexa : 'black'
				};
			}
		}).addTo(map);
		L.circle([geo.center[1], geo.center[0]], {
			radius: 10,
			fillColor: geo.isConnecting ? 'white' : 'black',
			opacity: 1,
			fillOpacity: 1,
			color: 'black'
		}).addTo(map);
	};

	$effect(() => {
		drawMap(showColors);
	});

	$effect(() => {
		if (!stop) return;
		getMinimapFeatures(stop).then((result) => {
			geo = result;
			if (!geo) return;
			drawMap(showColors);
		});
	});

	onMount(() => {
		map = L.map(mapContainer, {
			zoomControl: false,
			dragging: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			boxZoom: false,
			keyboard: false,
			touchZoom: false
		});
		const tiles = L.tileLayer(
			'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
			{
				attribution: 'Carto'
			}
		).addTo(map);
		tiles.addEventListener('tileload', (e) => {
			e.tile.setAttribute('fetchpriority', 'high');
		});
	});
</script>

<div bind:this={mapContainer}></div>

<style scoped>
	div {
		width: 300px;
		max-width: 95%;
		background: #eee;
		height: 300px;
		overflow: hidden;
		margin: 10px auto;
		border-radius: 10px;
	}
</style>
