<script lang="ts">
	import type { PageData } from './$types';
	import ListItem from './listItem.svelte';

	export let data: PageData;
</script>

<div class="container">
	{#each data.functions as { name }}
		<ListItem {name} />
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
