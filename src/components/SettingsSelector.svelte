<script lang="ts">
	import { storage } from '$lib/storage';
	import Toggle from './Toggle.svelte';

	const { editable = true } = $props();

	const modes = ['metro', 'tram', 'rer', 'transilien'] as (keyof typeof $storage.enabledTypes)[];



</script>


<div class="settings-selector" data-editable={editable}>
	{#each modes as mode (mode)}
		<div>
			<span>{mode}</span>
			<div>
				<label for={mode}>
					<img
						src={`/images/1x/${mode}.webp`}
						srcset={`/images/1x/${mode}.webp 1x, /images/2x/${mode}.webp 2x, /images/3x/${mode}.webp 3x`}
						alt={mode}
						width={32}
						height={32}
					/>
				</label>
				<input type="checkbox"
							 bind:checked={$storage.enabledTypes[mode]}
							 disabled={!editable ||
							 $storage.enabledTypes[mode] &&
						 	 Object.values($storage.enabledTypes)
						 	 .filter(val => val).length === 1}
							 id={mode}
							 tabindex={editable ? 0 : -1}
				/>
			</div>
		</div>
	{/each}
	<div class="coline-mode">
		<span id="coline">Mode Facile</span>
		<div class="toggle-container">
			<Toggle bind:value={$storage.colineMode} disabled={!editable} />
		</div>
	</div>
</div>

<style>
	.settings-selector {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 50px;
		align-items: center;
		transition: opacity 0.3s ease;
	}

	[data-editable='false'] {
		opacity: 0.5;
		cursor: not-allowed;

		& * {
			pointer-events: none;
		}
	}

	img {
		width: 32px;
		height: 32px;
	}

	.settings-selector > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;

		& > span {
			font-weight: bold;
			text-transform: capitalize;
		}

		& > div {
			display: flex;
			align-items: center;
			gap: 10px;
		}
	}

	label, input {
		cursor: pointer;
	}

	input {
		width: 16px;
		height: 16px;
	}

	.toggle-container {
		height: 32px;
	}

	@media screen and (max-width: 600px) {
		.settings-selector {
			gap: 20px;
			flex-wrap: wrap;
		}
	}
</style>