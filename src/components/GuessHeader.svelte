<div class="guess-header">
	<div class="guess-header-cell name">Nom</div>
	<div class="guess-header-cell">Lignes</div>
	<div class="guess-header-cell">Ville</div>
	<div class="guess-header-cell">Zone</div>
	<div class="guess-header-cell">Distance</div>
</div>

<style>
	.guess-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 20px;
		margin: 30px auto;
	}

	.guess-header-cell {
		position: relative;
		width: 100px;
		text-align: center;
		background: #f0f0f0;
		padding: 8px 0;
		border-radius: 10px;
	}

	.guess-header-cell.name {
		width: 300px;
	}
</style>
