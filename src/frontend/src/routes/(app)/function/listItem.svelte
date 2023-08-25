<script lang="ts">
	export let name: string;
</script>

<a class="wrapper" href={`/function/${name}`}>
	<div>
		{name}
	</div>
	<div>
		{name}
	</div>
	<div>
		{name}
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
