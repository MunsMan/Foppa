<script lang="ts">
	export let type: 'text' | 'password' = 'text';
	export let id: string;
	export let options: string[] = [];
	export let label: string = id[0].toUpperCase() + id.slice(1);
	export let errorMessage = '';
	export let defaultValue = '';
	export let error = false;
</script>

<div class="container">
	<div class="status">
		{#if error}
			<p style="color: {'red'}">{errorMessage ?? 'Something is wrong here!'}</p>
		{/if}
	</div>
	<label for={id} style="text-align: left;">{label} </label>
	<input
		class="input"
		name={id}
		style="border-bottom: 2px solid {errorMessage ? 'red' : 'blue'};"
		{id}
		{type}
		value={defaultValue}
		list={'options-' + label}
	/>
	{#if options}
		<datalist id={'options-' + label}>
			{#each options as option}
				<option>{option}</option>
			{/each}
		</datalist>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 60px;
	}
	.status {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		height: 20px;
	}
	.input {
		outline: none;
		background-color: none;
		border: none;
		border-radius: 5px;
	}
</style>
