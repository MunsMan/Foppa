<script lang="ts">
	export let style = '';
</script>

<div {style} class="row">
	<slot />
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
</style>
