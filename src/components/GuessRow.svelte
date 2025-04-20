<script lang="ts">
	import type { Guess } from '$lib/models/guess.model';
	import { blur } from 'svelte/transition';

	type Props = {
		guess?: Guess;
	};
	let { guess }: Props = $props();

</script>

<div class="guess-row" transition:blur={{duration: 200}}>
	<div class="guess-row-cell name"
			 data-correct={guess ? guess.name.correct : 'neutral'}>{guess ? guess.name.value : 'Nom'}</div>
	<div class="guess-row-cell lines"
			 title="Vert si toutes les lignes sont correctes, orange si certaines le sont, rouge si aucune n'est correcte"
			 data-correct={guess ? guess.lines.correct : 'neutral'}>
		{#if guess}
			{#each guess.lines.value as line (line.name)}
				<img src={line.picto} alt={line.name} width={28} />
			{/each}
		{:else}
			Lignes
		{/if}
	</div>
	<div class="guess-row-cell"
			 data-correct={guess ? guess.town.correct : 'neutral'}>{guess ? guess.town.value : 'Ville'}</div>
	<div class="guess-row-cell"
			 data-correct={guess ? guess.zone.correct : 'neutral'}>{guess ? guess.zone.value : 'Zone'}</div>
	<div class="guess-row-cell distance" data-correct={guess ?
	guess.distance.correct : 'neutral'}>
		{#if guess}
			{#if guess.distance.correct !== 'correct'}
				<img class="guess-angle"
						 style:transform={`rotate(${ guess.distance.value.angle}deg)`}
						 src="/arrow.png"
						 alt="^"
				/>

			{/if}
			<div class="guess-distance">{guess.distance.value.distance.toFixed(0)}m
			</div>
		{:else}
			Distance
		{/if}
	</div>
</div>


<style>
    .guess-row {
        display: flex;
        justify-content: center;
        gap: 20px;
        align-items: center;
        margin: 10px 0;
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

		.guess-row-cell.distance {
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 5px;
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

    .guess-row-cell[data-correct='neutral'] {
        border-radius: 0;
        background: #0E0F4F;
        color: white;
        font-size: 16pt;
    }

</style>