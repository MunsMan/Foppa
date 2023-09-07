<script lang="ts">
	export let type: 'button' | 'submit' | undefined = 'button';
</script>

<button class="button" {type}><slot /></button>

<style>
	.button {
		background-color: blue; /* Green */
		border: none;
		border-radius: 5px;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}
</style>
