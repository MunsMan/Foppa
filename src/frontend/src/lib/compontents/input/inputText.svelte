<script lang="ts">
	export let allowed: string[] = [];
	export let label: string;
	export let text = '';
	export let valid = false;
	let untouched = true;
	let status = 'Here is something wrong!';
	let empty = true;

	export let validate: ValidationFunction = (
		text: string,
		allowed: string[]
	): [boolean, string] => {
		if (text.length <= 0) {
			return [false, 'This is required!'];
		}
		if (allowed.length === 0) {
			return [true, 'Valid'];
		}
		if (allowed.includes(text)) {
			return [true, 'Valid'];
		}
		return [false, 'Invalid Option'];
	};

	$: {
		[valid, status] = validate(text, allowed);
		empty = text.length === 0;
	}
</script>

<div class="container">
	<div class="status">
		{#if !untouched}
			<p style="color: {valid ? 'green' : 'red'}">{status}</p>
		{/if}
	</div>
	<label for={'text-field-' + label}>{label}</label>
	<input
		bind:value={text}
		class="input"
		style="border-bottom: 2px solid {valid ? 'green' : empty ? 'blue' : 'red'};"
		id={'text-field-' + label}
		type="text"
		list={'options-' + label}
		on:focusout={() => {
			untouched = false;
		}}
	/>
	{#if allowed.length !== 0}
		<datalist id={'options-' + label}>
			{#each allowed as option}
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
