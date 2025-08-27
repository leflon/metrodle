<script lang="ts">
	import { getRandomStation, sendGame, sendGuess } from '$lib/api';
	import type { Guess } from '$lib/models/guess.model';
	import { storage } from '$lib/storage.js';
	import { onMount } from 'svelte';
	import { Confetti } from 'svelte-confetti';
	import { fade } from 'svelte/transition';
	import '../assets/main.css';
	import Footer from '../components/Footer.svelte';
	import GuessRow from '../components/GuessRow.svelte';
	import MiniMap from '../components/MiniMap.svelte';
	import SettingsSelector from '../components/SettingsSelector.svelte';
	import StopInput from '../components/StopInput.svelte';

	let toGuess: string | null = $state(null);
	let selectedStop = $state(null);
	let guesses: Guess[] = $state([]);
	let hasForfeited = $state(false);
	// Only fetched when user forfeits
	let correctGuess: Guess | null = $state(null);

	let inputContainerClass = $state('');

	let hasWon = $derived(guesses.find((g) => g.isCorrect) !== undefined);
	let canEditSettings = $derived(guesses.length === 0);
	let unzoomMap = $derived(hasWon || hasForfeited);

	let inputContainer: HTMLDivElement;

	onMount(async () => {
		toGuess = await getRandomStation($storage.enabledTypes);
	});

	$effect(() => {
		if (hasWon === true) sendGame(guesses, toGuess!, 'finished');
	});

	async function handleGuess() {
		if (selectedStop) {
			guesses.push(await sendGuess(selectedStop, toGuess!));
			selectedStop = null;
			setTimeout(() => {
				if (!document.scrollingElement) return;
				document.scrollingElement.scrollTo({
					top: document.scrollingElement.scrollHeight
				});
			});
		}
	}

	const reset = async () => {
		const oldToGuess = toGuess;
		// No matter what, we reset the station to guess
		toGuess = await getRandomStation($storage.enabledTypes);
		hasForfeited = false;
		correctGuess = null;
		selectedStop = null;
		// Send game and reset guesses only if the game was played
		if (guesses.length === 0) return;
		if (!hasWon) sendGame(guesses, oldToGuess!, 'reset');
		guesses = [];
	};

	const forfeit = async () => {
		hasForfeited = true;
		correctGuess = await sendGuess(toGuess!, toGuess!);
		sendGame(guesses, toGuess!, 'forfeit');
	};

	const handleScroll = () => {
		if (!inputContainer) return;
		const y = inputContainer!.getBoundingClientRect().top;
		inputContainerClass = y > 0 ? '' : 'sticked';
	};

	const handleBeforeUnload = () => {
		if (!hasWon) sendGame(guesses, toGuess!, 'leave');
	};
</script>

<svelte:document onscroll={handleScroll} />

<svelte:window onbeforeunload={handleBeforeUnload} />
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
	<title>Metrodle</title>
</svelte:head>
<img
	class="main-logo"
	src="/images/1x/full-logo.webp"
	srcset="/images/1x/full-logo.webp 1x, /images/2x/full-logo.webp 2x, /images/3x/full-logo.webp 3x"
	alt="Metrodle"
	fetchpriority="high"
	width={400}
	height={100}
/>
<SettingsSelector editable={canEditSettings} />
{#if toGuess && $storage.showMap}
	<MiniMap stop={toGuess} unzoom={unzoomMap} />
{/if}
<div class={'input-container ' + inputContainerClass} bind:this={inputContainer}>
	<div class="input-container-blur"></div>
	<StopInput bind:selected={selectedStop} disabled={hasWon || hasForfeited} />
	<button tabindex={0} onclick={handleGuess}>Valider</button>
	<button onclick={reset}>Recommencer</button>
</div>
<div class="guess-container">
	<GuessRow />
	{#each guesses as guess, index (index)}
		<GuessRow {guess} />
	{/each}
	{#if guesses.length === 0}
		<div out:fade={{ duration: 200 }} in:fade={{ delay: 500 }} class="start-hint">
			Essayez de deviner la station !
		</div>
	{/if}
</div>
{#if !hasWon && !hasForfeited}
	<div class="button-container">
		<button onclick={forfeit}>Réveler la réponse</button>
	</div>
{/if}
{#if hasForfeited && correctGuess}
	<div class="separator"></div>
	<GuessRow guess={correctGuess} />
{/if}
{#if hasWon}
	<div class="confetti-container">
		<Confetti
			colorArray={[
				'#FFCE00',
				'#0064B0',
				'#9F9825',
				'#98D4E2',
				'#C04191',
				'#F28E42',
				'#83C491',
				'#F3A4BA',
				'#CEADD2',
				'#D5C900',
				'#E3B32A',
				'#8D5E2A',
				'#00814F',
				'#662483',
				'#B90845',
				'#00A88F'
			]}
			x={[-1.5, 1.5]}
			y={[0, 3]}
			fallDistance="100px"
			amount={400}
			cone={true}
			size={10}
		/>
	</div>
	<div class="button-container" in:fade={{ delay: 200 }} out:fade={{ duration: 0 }}>
		<button onclick={reset}>Rejouer</button>
	</div>
{/if}
<Footer></Footer>

<style>
	img {
		display: block;
		width: 400px;
		max-width: 80%;
		object-fit: contain;
		margin: 20px auto;
	}

	.start-hint {
		font: bold 18pt 'Parisine';
		text-align: center;
		margin: 30px 0;
	}

	.confetti-container {
		position: fixed;
		bottom: 0;
		left: 50%;
	}

	.input-container {
		display: flex;
		justify-content: center;
		position: sticky;
		top: 0;
		align-items: center;
		flex-wrap: wrap;
		gap: 20px;
		z-index: 90;
		padding: 20px 5px;
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
		mask-image: linear-gradient(to top, transparent 0%, #000f 40%);
		z-index: 0;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.input-container.sticked .input-container-blur {
		opacity: 1;
	}

	.button-container {
		padding: 10px;
		display: flex;
		justify-content: center;
	}

	.separator {
		width: 100px;
		max-width: 50%;
		height: 1px;
		background: #aaa;
		margin: 5px auto;
	}
</style>
