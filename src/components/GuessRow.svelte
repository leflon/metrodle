<script lang="ts">
	import type { Guess } from '$lib/models/guess.model';
	import { storage } from '$lib/storage';
	import { blur } from 'svelte/transition';

	type Props = {
		guess?: Guess;
	};
	let { guess }: Props = $props();

</script>

<div class="guess-row" transition:blur={{duration: 200}}
		 data-coline={$storage.colineMode}>
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
	guess.distance.correct : 'neutral'} data-displayed={$storage.colineMode}>
		{#if guess}
			{#if guess.distance.correct !== 'correct'}
				<img class="guess-angle"
						 style:transform={`rotate(${ guess.distance.value.angle}deg)`}
						 src="/images/1x/arrow.webp"
						 srcset="/images/1x/arrow.webp 1x, /images/2x/arrow.webp 2x,/images/3x/arrow.webp 3x"
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
		display: grid;
		grid-template-columns: repeat(6, minmax(50px, 1fr) );
		align-items: center;
		width: 800px;
		gap: 30px;
		min-height: 40px;
		margin: 10px auto;
		&[data-coline='false'] {
			grid-template-columns: repeat(5, minmax(50px, 1fr) );
		}
	}

	.guess-row-cell {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 0;
		height: 100%;
		border-radius: 10px;
		overflow-x: auto;
		text-align: center;
	}

	.guess-row-cell.name {
		grid-column-end: span 2;
	}

	.guess-row-cell.lines {
		gap: 5px;
		cursor: help;
		flex-wrap: wrap;
		overflow-x: auto;
	}

	.guess-row-cell.distance {
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
		font-weight: bold;
		overflow: hidden;
	}

	.distance[data-displayed='false'] {
		display: none;
	}

	@media screen and (max-width: 850px) {
		.guess-row-cell {
			font-size: 9pt;
			padding: 5px;
			border-radius: 0;
			text-align: center;
		}

		.guess-row-cell[data-correct='neutral'] {
			font-size: 10pt;
			justify-content: center;
		}

		.guess-row {
			gap: 0;
			width: 100%;
			box-sizing: border-box;
			margin: 10px auto;
		}

		.guess-row-cell.lines {
			flex-wrap: wrap;
			gap: 1px;
		}

		.guess-row-cell.distance {
			gap: 1px;
		}

		.guess-row-cell img {
			width: 16px;
		}
	}
</style>
