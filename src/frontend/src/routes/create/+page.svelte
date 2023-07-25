<script lang="ts">
	import InputText from '$lib/compontents/input/inputText.svelte';
	import { runtimes, regions } from '$lib/aws/constants';
	import { functionNameValidation } from '$lib/validation/functionName';

	let code: FileList;
	let runtime: string;
	let region: string;
	let role: string;

	let disabled_button: boolean;

	let valid_runtime = false;
	let valid_region = false;
	let valid_role = false;
	let valid_functionName = false;

	const valid_code = (code: FileList | undefined) => {
		if (!code) {
			return false;
		}
		if (code.length !== 1) {
			return false;
		}
		return true;
	};
	const onUpload = () => {
		console.log('Upload');
	};

	$: {
		disabled_button = !(valid_runtime && valid_role && valid_region && valid_code(code));
	}
</script>

<div class="container">
	<div>
		<h1 style="text-align: center;">Upload a Function</h1>
	</div>
	<InputText
		validate={functionNameValidation}
		label="Function Name"
		bind:valid={valid_functionName}
	/>
	<InputText allowed={runtimes} label="Runtime" bind:text={runtime} bind:valid={valid_runtime} />
	<InputText allowed={regions} label="Region" bind:text={region} bind:valid={valid_region} />
	<InputText label="Role" bind:text={role} bind:valid={valid_role} />
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
