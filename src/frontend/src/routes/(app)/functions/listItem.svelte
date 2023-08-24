<script lang="ts">
	export let name: string;
</script>

<div class="wrapper">
	<div>
		{name}
	</div>
	<div>
		{name}
	</div>
	<div>
		{name}
	</div>
</div>

<style>
	.wrapper {
		border: solid gray 1px;
		border-radius: 5px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 5px;
		margin: 5px;
	}
</style>
