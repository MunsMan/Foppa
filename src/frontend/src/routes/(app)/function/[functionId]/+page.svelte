<script lang="ts">
	import Button from '$lib/compontents/button/button.svelte';
	import Column from '$lib/compontents/column/column.svelte';
	import Row from '$lib/compontents/row/row.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// ToDo: Dropdown to select region
</script>

<div>
	<Row>
		<table class="table">
			<tr>
				<td> Function Name </td>
				<td>
					{data.functionName}
				</td>
			</tr>
			<tr>
				<td> Function ID </td>
				<td>
					{data.functionId}
				</td>
			</tr>
			<tr>
				<td> Global Executions </td>
				<td>
					{data.executionCounter}
				</td>
			</tr>
			<tr>
				<td> Executions per Region </td>
				<td>
					{data.regions
						.map(
							(region) => `${region.provider} - ${region.region}: ${region.regionExecutionCount}`
						)
						.join('\n')}
				</td>
			</tr>
		</table>
	</Row>
	<Row>
		<h2>Function Runner</h2>
	</Row>
	<form method="post">
		<Row>
			<div>
				<textarea rows="15" cols="30" name="json" placeholder="Enter JSON Payload" />
			</div>
			<Column style="justify-content: space-around;">
				<Button type="submit">Trigger</Button>
			</Column>
		</Row>
	</form>
</div>

<style>
	td {
		padding-left: 10px;
		padding-right: 10px;
		padding-top: 5px;
		padding-bottom: 5px;
	}
	textarea {
		font-size: 1.5rem;
	}
</style>
