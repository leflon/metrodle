export function plainify(str: string): string {
	return str.toLowerCase().replace(/[ -']/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}