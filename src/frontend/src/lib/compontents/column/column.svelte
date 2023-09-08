<script lang="ts">
	export let style = '';
</script>

<div class="column" {style}>
	<slot />
</div>

<style>
	.column {
		display: flex;
		flex-direction: column;
	}
</style>
