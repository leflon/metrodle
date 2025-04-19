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
</svelte:head>
<div class="beta">BETA</div>
<img src="/logo.png" alt="Metrodle" />
<div class="input-container">
	<div class="input-container-blur"></div>
	<StopInput bind:selected={selectedStop} />
	<button tabindex={99} onclick={handleGuess}>Valider</button>
	<button onclick={_e => reset()} disabled={!canReset}>Recommencer</button>
</div>
<div class="guess-container">
<GuessHeader></GuessHeader>
{#each guesses as guess, index (index)}
	<GuessRow guess={guess} />
{/each}
</div>
<style>
    img {
        display: block;
        width: 400px;
        max-width: 80%;
        object-fit: contain;
        margin: 20px auto;
    }
		.beta {
				position: fixed;
				background: red;
				color: white;
				font: 14pt 'Parisine';
				padding: 5px 40px;
				transform: rotate(45deg) translate(25%, -40%);
				top: 0;
				right: 0;
				z-index: 99;
		}
    .input-container {
        display: flex;
        justify-content: center;
				position: sticky;
				top: 0;
        align-items: center;
				flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
				z-index: 90;
				padding: 20px 10px;
    }

		.input-container button {
        z-index: 99;
		}

		.input-container-blur {
        position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 120%;
        inset: 0;
        backdrop-filter: blur(5px);
        /* Gradient mask: fully transparent at bottom, opaque at top */
        mask-image: linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%);
				z-index: 0;
		}
		.guess-container {
				padding: 10px;
		}
</style>
