export type Stop = {
	id: string;
	name: string;
	/* Name without accents */
	plain_name: string;
	lines: string[];
	town: string;
	fare_zone: string;
	geo: string;
};
