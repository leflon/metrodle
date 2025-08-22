<script lang="ts">
	let { value = $bindable(), disabled = false } = $props();

	const toggleValue = () => {
		if (disabled) return;
		value = !value;
	};
</script>

<button
	class="toggle-container"
	data-value={value}
	onclick={toggleValue}
	tabindex={disabled ? -1 : 0}
	{disabled}
>
	<div class="toggle-bar"></div>
	<div class="toggle-circle">
		<img
			src="/images/1x/check.webp"
			srcset="/images/1x/check.webp 1x, /images/2x/check.webp 2x, /images/3x/check.webp 3x"
			alt="Check"
			width={16}
		/>
		<img
			src="/images/1x/close.webp"
			srcset="/images/1x/close.webp 1x, /images/2x/close.webp 2x, /images/3x/close.webp 3x"
			alt="X"
			width={16}
		/>
	</div>
</button>

<style>
	button {
		all: unset;
	}
	.toggle-container {
		position: relative;
		padding: 0;
		background: none;
		cursor: pointer;
		filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));

		&:active {
			transform: none;
		}
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
		transition:
			left 0.3s ease,
			transform 0.3s ease;
	}

	.toggle-circle img {
		position: absolute;
		object-fit: cover;
		transition: opacity 0.3s ease;
	}

	[data-value='true'] .toggle-circle img:last-child {
		opacity: 0;
	}

	[data-value='false'] .toggle-circle img:first-child {
		opacity: 0;
	}

	[data-value='true'] .toggle-circle {
		left: 100%;
		transform: translate(-100%, -50%);
	}

	[data-value='false'] .toggle-bar {
		background-color: #ff2521;
	}

	[disabled] {
		cursor: not-allowed;
	}
</style>
