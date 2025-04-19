
type Correctness = 'correct' | 'incorrect' | 'partial';

export type GuessEntry<T = string> = {
	value: T;
	correct: Correctness;
}

export type Guess = {
	name: GuessEntry,
	lines: GuessEntry<{
		name: string;
		picto: string
	}[]>,
	town: GuessEntry,
	zone: GuessEntry,
	distance: GuessEntry<number>
	isCorrect: boolean,
}