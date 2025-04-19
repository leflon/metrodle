<script lang='ts'>
	import '../assets/main.css';
	import type {Guess} from '$lib/models/guess.model';
	import GuessHeader from '../components/GuessHeader.svelte';
	import StopInput from '../components/StopInput.svelte';
	import GuessRow from '../components/GuessRow.svelte';

	let { data }: {data: {stop: string}} = $props();
	let toGuess = $state(data.stop);
	let selectedStop = $state(null);
	let guesses: Guess[] = $state([]);

	let canReset = $derived(guesses.length > 0);

	async function handleGuess() {
		if (selectedStop) {
			const result = await fetch(`/api/guess?guess=${selectedStop}&correct=${toGuess}`);
			guesses.push(await result.json());
			selectedStop = null;
		}
	}

	const reset = async () => {
		if (guesses.length === 0)
			return;
		guesses = [];
		selectedStop = null;
		const res = await fetch(`/api/random-station`);
		toGuess = (await res.json()).id;
	}
</script>

<svelte:head>
	<link
		rel="preload"
		as="font"
		href="/fonts/Parisine.otf"
		type="font/otf"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		as="font"
		href="/fonts/Parisine Bold.otf"
		type="font/otf"
		crossorigin="anonymous"
	/>
</svelte:head>
<div class="beta">BETA</div>
<img src="/logo.png" alt="Metrodle" />
<div class="input-container">
	<StopInput bind:selected={selectedStop} />
	<button tabindex={99} onclick={handleGuess}>Valider</button>
	<button onclick={_e => reset()} disabled={!canReset}>Recommencer</button>
</div>
<GuessHeader></GuessHeader>
{#each guesses as guess, index (index)}
	<GuessRow guess={guess} />
{/each}
{toGuess}
<style>
		.beta {
				position: fixed;
				background: red;
				color: white;
				font: 14pt 'Parisine';
				padding: 5px 40px;
				transform: rotate(45deg) translate(25%, -40%);
				top: 0;
				right: 0;
		}
    .input-container {
        display: flex;
        justify-content: center;
        align-items: center;
				flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
    }

		img {
				display: block;
				width: 400px;
				max-width: 80%;
				object-fit: contain;
				margin: 20px auto;
		}
</style>
