export function plainify(str: string): string {
	return str
		.toLowerCase()
		.replace(/[ \-\(\)\[\]']/g, '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function (this: any, ...args: Parameters<T>): void {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}
