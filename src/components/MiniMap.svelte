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
		stop: string;
	};
	let { stop }: Props = $props();

	let showColors = $state($storage.colineMode);

	const drawMap = () => {
		console.log('draw');
		if (!geo) return;
		map.setView([geo.center[1], geo.center[0]], 16);
		L.geoJSON(geo.features, {
			style: (feature) => {
				return {
					// TER lines included in the GeoJSON dataset might appear over regular
					// lines, hiding their color.
					opacity: feature?.properties.mode === 'TER' ? 0 : 1,
					weight: 5,
					color: showColors ? '#' + feature?.properties.colourweb_hexa : 'black'
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

	storage.subscribe((value) => {
		if (value.colineMode !== showColors) {
			// Trigger redraw only when this value changes.
			showColors = value.colineMode;
			drawMap();
		}
	});

	$effect(() => {
		getMinimapFeatures(stop).then((result) => {
			geo = result;
			if (!geo) return;
			drawMap();
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
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png').addTo(map);
	});
</script>

<div bind:this={mapContainer}></div>

<style scoped>
	div {
		width: 300px;
		height: 300px;
		overflow: hidden;
		margin: 10px auto;
		border-radius: 10px;
	}
</style>
