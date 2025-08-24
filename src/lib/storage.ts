import { writable } from 'svelte/store';

type MetrodleStorage = {
	/* Transport types the user wants to guess */
	enabledTypes: {
		metro: boolean;
		tram: boolean;
		rer: boolean;
		train: boolean;
	};
	/* Hard mode: removign the distance/direction from hints and removing colors from map */
	hardMode: boolean;
	showMap: boolean;
};

let storedEnabled;
let storedHard;
let storedShowMap;

try {
	storedEnabled = JSON.parse(localStorage.getItem('metrodle:enabledTypes') || '');
	storedHard = JSON.parse(localStorage.getItem('metrodle:hardMode') || '');
	storedShowMap = JSON.parse(localStorage.getItem('metrodle:showMap') || '');
} catch {
	storedEnabled ??= {
		metro: true,
		tram: false,
		rer: false,
		transilien: false
	};
	storedHard ??= false;
	storedShowMap ??= true;
}
export const storage = writable<MetrodleStorage>({
	enabledTypes: storedEnabled,
	hardMode: storedHard,
	showMap: storedShowMap
});

storage.subscribe((val) => {
	if (Object.values(val.enabledTypes).filter((v) => v).length === 0)
		val.enabledTypes = { metro: true, tram: false, rer: false, train: false };
	Object.entries(val).forEach(([k, v]) => {
		typeof window !== 'undefined' && localStorage.setItem(`metrodle:${k}`, JSON.stringify(v));
	});
});
