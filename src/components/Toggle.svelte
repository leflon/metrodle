<script lang="ts">
	let { value = $bindable() } = $props();

	const toggleValue = () => value = !value;
</script>
<div class="toggle-container" data-value={value} onclick={toggleValue}>
	<div class="toggle-bar"></div>
	<div class="toggle-circle">
		<img src="/check.png" alt="Check" />
		<img src="/close.png" alt="X" />
	</div>
</div>

<style>
	.toggle-container {
		position: relative;
		cursor: pointer;
		filter: drop-shadow(0 5px 5px rgba(0,0,0,0.2));
	}
	.toggle-bar {
		width: 40px;
		height: 16px;
		background-color: #35b0ff;
		border-radius: 10em;
		transition: background-color 0.3s ease;
	}
	.toggle-circle {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		top: 50%;
		transform: translateY(-50%);
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		left: 0;
		transition: left 0.3s ease, transform 0.3s ease;
	}

	.toggle-circle img {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.3s ease;
	}

	[data-value="true"] .toggle-circle img:last-child {
		opacity: 0;
	}
	[data-value="false"] .toggle-circle img:first-child {
		opacity: 0;
	}
	[data-value="true"] .toggle-circle {
		left: 100%;
		transform: translate(-100%,-50%);
	}

	[data-value="false"] .toggle-bar {
		background-color: #ff2521;
	}
</style>