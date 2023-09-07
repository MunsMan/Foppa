<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/compontents/button/button.svelte';
	import Input from '$lib/compontents/input/input.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	const redirect = $page.url.searchParams.get('redirect') ?? '/';
</script>

<div class="container">
	<h1 class="text">Sign In</h1>
	{#if form?.status === 'alreadyExists'}
		<div class="row">
			<div class="error">
				<p>The Username already Exists!</p>
			</div>
		</div>
	{/if}
	{#if form?.status === 'notEqual'}
		<div class="row">
			<div class="error">
				<p class="text">Your password inputs don't match!</p>
			</div>
		</div>
	{/if}
	{#if form?.status === 'error'}
		<div class="row">
			<div class="error">
				<p class="text">Something when wrong!<br />please try it later again</p>
			</div>
		</div>
	{/if}
	<form method="post">
		<div class="row">
			<Input id="username" defaultValue={form?.username} />
		</div>
		<div class="row">
			<Input type="password" id="password" />
		</div>
		<div class="row">
			<Input type="password" id="password-2" label="Confirmation" />
		</div>
		<div class="row"><Button type="submit">Sign In</Button></div>
	</form>
	<div class="row text">
		<p>or<br />Do you have an <a href={`/login?redirect=${redirect}`}>Account</a>?</p>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}
	.row {
		margin: 1vh;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	.text {
		text-align: center;
	}
	.error {
		border: solid 1px red;
		border-radius: 5px;
		background-color: rgba(200, 10, 10, 0.5);
		color: whitesmoke;
		width: 50%;
	}
</style>
