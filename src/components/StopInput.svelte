<script lang="ts">
	import { debounce } from 'lodash';
	import type { Completion } from '$lib/models/completion.model';
	import { plainify } from '$lib/utils';
	import type { FormEventHandler } from 'svelte/elements';

	interface Props {
		selected: string | null;
		disabled: boolean;
	}

	let { selected = $bindable(null), disabled = false }: Props = $props();
	let query = $state('');
	let completions: Completion[] = $state([]);
	let isDropdownVisible = $state(false);

	$effect(() => {
		if (selected === null)
			query = '';
	});

	const fetchResults = debounce(async (searchTerm) => {
		if (!searchTerm || disabled) {
			completions = [];
			isDropdownVisible = false;
			return;
		}

		try {
			const response = await fetch(`/api/completions?input=${searchTerm}`);
			if (response.ok) {
				completions = (await response.json()).completions;
				isDropdownVisible = completions.length > 0;
			} else {
				console.error('Failed to fetch results');
			}
		} catch (error) {
			console.error('Error fetching results:', error);
		}
	}, 300); // Debounce to avoid overloading API with requests

	const handleInput: FormEventHandler<HTMLInputElement> = () => {
		if (!disabled)
			fetchResults(query);
	};

	function selectResult(result: Completion) {
		if (disabled) return;
		query = result.name;
		selected = result.id;
		isDropdownVisible = false;
	}

	function boldCompletion(completion: Completion) {
		const index = completion.plain_name.indexOf(plainify(query));
		const boldSection = completion.name.substring(index, index + query.length);
		return completion.name.replace(new RegExp(`(${boldSection})`), '<b>$1</b>');
	}
</script>

<div class="stop-input">
	<input type="text" bind:value={query} oninput={handleInput} placeholder="La Motte-Picquet - Grenelle" />
	{#if isDropdownVisible}
		<div class="dropdown">
			{#each completions as completion, index (completion.id)}
				<div
					role="button"
					tabindex={index}
					class="dropdown-item"
					onkeydown={(e) => e.key === 'Enter' && selectResult(completion)}
					onclick={() => selectResult(completion)}
				>
					{@html boldCompletion(completion)}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.stop-input {
		position: relative;
		width: 400px;
		max-width: 100%;
		display: flex;
		z-index: 100;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		padding: 10px;
		font: 16px 'Parisine';
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
	}

	.dropdown-item {
		padding: 10px;
		cursor: pointer;
	}

	.dropdown-item:hover,
	.dropdown-item:focus {
		background: #f0f0f0;
	}
</style>
