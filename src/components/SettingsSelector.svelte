<script>
	import {storage} from '$lib/storage';
</script>


<div class="settings-selector">
	<div>
		<label for="metro">
			<img src="/transport-logos/metro.webp" alt="metro" />
		</label>
		<input type="checkbox"
					 bind:checked={$storage.enabledTypes.metro}
					 disabled={$storage.enabledTypes.metro &&
					 Object.values($storage.enabledTypes).filter(val => val).length === 1}
					 id="metro" />
	</div>
	<div>
		<label for="tram">
			<img src="/transport-logos/tram.webp" alt="tram" />
		</label>
		<input type="checkbox"
					 bind:checked={$storage.enabledTypes.tram}
					 disabled={$storage.enabledTypes.tram &&
					 Object.values($storage.enabledTypes).filter(val => val).length === 1}
					 id="tram" />
	</div>
	<div>
		<label for="rer">
			<img src="/transport-logos/rer.webp" alt="rer" />
		</label>
		<input type="checkbox"
					 bind:checked={$storage.enabledTypes.rer}
					 disabled={$storage.enabledTypes.rer &&
					 Object.values($storage.enabledTypes).filter(val => val).length === 1}
					 id="rer" />
	</div>
	<div>
		<label for="transilien">
			<img src="/transport-logos/transilien.webp" alt="transilien" />
		</label>
		<input type="checkbox"
					 bind:checked={$storage.enabledTypes.transilien}
					 disabled={$storage.enabledTypes.transilien &&
					 Object.values($storage.enabledTypes).filter(val => val).length === 1}
					 id="transilien" />
	</div>
</div>

<style>
	.settings-selector {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 50px;
		align-items: center;
	}

	img {
		width: 32px;
		height: 32px;
	}

	.settings-selector > div {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	label, input {
		cursor: pointer;
	}

	input {
		width: 16px;
		height: 16px;
	}
</style>