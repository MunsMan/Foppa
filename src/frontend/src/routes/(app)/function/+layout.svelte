<script>
	import Column from '$lib/compontents/column/column.svelte';
</script>

<Column>
	<h1><a href="/function">Your Functions</a></h1>
	<Column>
		<slot />
	</Column>
</Column>
