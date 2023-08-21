<script lang="ts">
	import Input from '$lib/compontents/input/input.svelte';
	import { runtimes, regions } from '$lib/aws/constants';

	let code: FileList;
	let runtime: string;
	let region: string;
	let role: string;
	let handler: string;

	let disabled_button: boolean;

	const readFile = async (file: File | null) => {
		return new Promise((resolve, rejects) => {
			if (!file) {
				return resolve('empty');
			}
			const reader = new FileReader();
			reader.onload = (data: ProgressEvent<FileReader>) => {
				if (!data) {
					return rejects();
				}
				if (!data.target) {
					return rejects();
				}
				resolve(data.target.result);
			};
			reader.onerror = (error) => {
				rejects(error);
			};
			reader.readAsDataURL(file);
		});
	};
	const onUpload = async () => {
		console.log('Upload');
		const file = await readFile(code.item(0));
		console.log(file);
		const response = await fetch(
			'https://hbx3q3qnp8.execute-api.us-east-1.amazonaws.com/create/test',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				mode: 'no-cors',
				cache: 'no-cache',
				body: JSON.stringify({
					region,
					runtime,
					role,
					handler,
					zip_file: file,
					username: 'test'
				})
			}
		);
		console.log(response);
	};
</script>

<div class="container">
	<div>
		<h1 style="text-align: center;">Upload a Function</h1>
	</div>
	<form />
	<Input label="Function Name" id="functionName" />
	<Input id="runtime" options={runtimes} />
	<Input id="region" options={regions} />
	<Input id="handler" />
	<Input id="role" />
	<div class="row">
		<div class="container">
			<label for="lambda" class="file-selector">
				Upload Code Package
				<input
					accept=".zip"
					bind:files={code}
					id="lambda"
					name="lambda"
					type="file"
					class="file-selector"
					style="display: none;"
				/></label
			>
		</div>
	</div>
	<div class="row">
		<button
			class="button"
			on:click={onUpload}
			disabled={disabled_button}
			style="cursor: {disabled_button ? 'not-allowed' : 'pointer'};">Deploy Lambda</button
		>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}
	.row {
		margin-top: 3vh;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	.button {
		border: none;
		border-radius: 5px;
		padding: 2vh 1vw;
		width: fit-content;
		box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}
	.file-selector {
		border-radius: 5px;
		padding: 2vh 1vw;
		width: fit-content;
		display: inline-block;
		cursor: pointer;
		box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}
</style>
