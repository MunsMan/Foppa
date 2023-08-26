<script lang="ts">
	import type { PageServerData } from './$types';
	import ListItem from './listItem.svelte';

	export let data: PageServerData;
</script>

<div class="container">
	{#each data.functions as { functionName, functionId, executionCounter }}
		<ListItem {functionName} {functionId} {executionCounter} />
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
