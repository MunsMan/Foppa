<script lang="ts">
	import Input from '$lib/compontents/input/input.svelte';
	import { runtimes, regions } from '$lib/aws/constants';
	import Button from '$lib/compontents/button/button.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let code: FileList;
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
</script>

<div class="container">
	<div>
		<h1 style="text-align: center;">Upload a Function</h1>
	</div>
	<form method="post">
		<Input
			label="Function Name"
			id="functionName"
			error={!form?.state?.functionName.valid}
			errorMessage={form?.state?.functionName.message}
			defaultValue={form?.state?.functionName.text}
		/>
		<Input
			id="runtime"
			options={runtimes}
			error={!form?.state?.runtime.valid}
			errorMessage={form?.state?.runtime.message}
			defaultValue={form?.state?.runtime.text}
		/>
		<Input
			id="region"
			options={regions}
			error={!form?.state?.region.valid}
			errorMessage={form?.state?.region.message}
			defaultValue={form?.state?.region.text}
		/>
		<Input
			id="handler"
			error={!form?.state?.handler.valid}
			errorMessage={form?.state?.handler.message}
			defaultValue={form?.state?.handler.text}
		/>
		<Input
			id="role"
			error={!form?.state?.role.valid}
			errorMessage={form?.state?.role.message}
			defaultValue={form?.state?.role.text}
		/>
		<div class="row">
			<div class="container">
				{#if !form?.state?.code.valid}
					<div class="status">
						<p style="color: {'red'}">{form?.state?.code.message}</p>
					</div>
				{/if}
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
			<Button>Deploy Lambda</Button>
		</div>
	</form>
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
	.file-selector {
		border-radius: 5px;
		padding: 2vh 1vw;
		width: fit-content;
		display: inline-block;
		cursor: pointer;
		box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}
</style>
