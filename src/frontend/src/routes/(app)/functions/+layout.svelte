<div class="container">
	<h1>Your Functions</h1>
	<div class="container">
		<div class="item">
			<slot />
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	.item {
		display: flex;
		flex-direction: row;
	}
</style>
