<script lang="ts">
	import type { Guess } from '$lib/models/guess.model';

	type Props = {
		guess: Guess;
	};
	let { guess }: Props = $props();
</script>

<div class="guess-row">
	<div class="guess-row-cell name"
			 data-correct={guess.name.correct}>{guess.name.value}</div>
	<div class="guess-row-cell lines"
			 title="Vert si toutes les lignes sont correctes, orange si certaines le sont, rouge si aucune n'est correcte"
			 data-correct={guess.lines.correct}>
		{#each guess.lines.value as line (line.name)}
			<img src={line.picto} alt={line.name} width={28} />
		{/each}
	</div>
	<div class="guess-row-cell" data-correct={guess.town.correct}>{guess.town.value}</div>
	<div class="guess-row-cell" data-correct={guess.zone.correct}>{guess.zone.value}</div>
	<div class="guess-row-cell" data-correct={guess.distance.correct}>{guess.distance.value.toFixed(0)}m</div>
</div>


<style>
    .guess-row {
        display: flex;
        justify-content: center;
        gap: 20px;
        align-items: center;
        padding: 10px 20px;
    }

    .guess-row-cell {
        text-align: center;
        width: 100px;
        padding: 8px 0;
        border-radius: 10px;
    }

    .guess-row-cell.name {
        width: 300px;
    }

    .guess-row-cell.lines {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 5px;
        cursor: help;
    }

    .guess-row-cell[data-correct='correct'] {
        background-color: #d4edda;
    }

    .guess-row-cell[data-correct='incorrect'] {
        background-color: #f8d7da;
    }

    .guess-row-cell[data-correct='partial'] {
        background-color: #ffcc8d;
    }
</style>