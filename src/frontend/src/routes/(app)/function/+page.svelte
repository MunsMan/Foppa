<script lang="ts">
	import Column from '$lib/compontents/column/column.svelte';
	import type { PageServerData } from './$types';
	import ListItem from './listItem.svelte';

	export let data: PageServerData;
</script>

<Column style="width: 100%">
	{#each data.functions as { functionName, functionId, executionCounter }}
		<ListItem {functionName} {functionId} {executionCounter} />
	{/each}
</Column>
