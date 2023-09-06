<script lang="ts">
	import Column from '$lib/compontents/column/column.svelte';
	import Row from '$lib/compontents/row/row.svelte';
	import type { PageServerLoad } from './$types';

	export let data: PageServerLoad;
	console.log(data);
</script>

<div style="text-align: left;">
	<Row>
		<h1>{data.functionName}</h1>
	</Row>
	<Row>
		<p>Function Name</p>
		<p>{data.functionName}</p>
	</Row>
	<Row>
		<p>Function Id</p>
		<p>{data.functionId}</p>
	</Row>
	<Row
		><h2>Regions</h2>
		<Column>
			{#each data.regions as { region, provider }}
				<Row
					><p>{provider} {region}</p>
					<p /></Row
				>
			{/each}
		</Column>
	</Row>
</div>
