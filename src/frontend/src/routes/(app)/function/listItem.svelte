<script lang="ts">
	export let functionName: string;
	export let functionId: string;
	export let executionCounter: string;
</script>

<a class="wrapper" href={`/function/${functionId}`}>
	<div>
		{functionName}
	</div>
	<div>
		{functionId}
	</div>
	<div>
		{executionCounter}
	</div>
</a>

<style>
	.wrapper {
		border: solid gray 1px;
		border-radius: 5px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 5px;
		margin: 5px;
		text-decoration: none;
		color: inherit;
	}
</style>
