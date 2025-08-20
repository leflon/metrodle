import { writable } from 'svelte/store';

type MetrodleStorage = {
	/* Transport types the user wants to guess */
	enabledTypes: {
		metro: boolean;
		tram: boolean;
		rer: boolean;
		train: boolean;
	};
	/* Easy mode: including the distance/direction in the hints */
	colineMode: boolean;
	showMap: boolean;
};

let storedEnabled;
let storedColine;
let storedShowMap;

try {
	storedEnabled = JSON.parse(localStorage.getItem('metrodle:enabledTypes') || '');
	storedColine = JSON.parse(localStorage.getItem('metrodle:colineMode') || '');
	storedShowMap = JSON.parse(localStorage.getItem('metrodle:showMap') || '');
} catch {
	storedEnabled ??= {
		metro: true,
		tram: false,
		rer: false,
		transilien: false
	};
	storedColine ??= false;
	storedShowMap ??= true;
}
export const storage = writable<MetrodleStorage>({
	enabledTypes: storedEnabled,
	colineMode: storedColine,
	showMap: storedShowMap
});

storage.subscribe((val) => {
	if (Object.values(val.enabledTypes).filter((v) => v).length === 0)
		val.enabledTypes = { metro: true, tram: false, rer: false, train: false };
	Object.entries(val).forEach(([k, v]) => {
		typeof window !== 'undefined' && localStorage.setItem(`metrodle:${k}`, JSON.stringify(v));
	});
});
