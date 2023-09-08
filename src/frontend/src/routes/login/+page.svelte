<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/compontents/button/button.svelte';
	import Input from '$lib/compontents/input/input.svelte';
	import type { ActionData } from './$types';

	const redirect = $page.url.searchParams.get('redirect') ?? '/';
	export let form: ActionData;
</script>

<div class="container">
	<h1 class="text">Login</h1>
	{#if form?.wrong}
		<div class="row">
			<div class="error">
				<p>Your username or password was wrong!</p>
			</div>
		</div>
	{/if}
	{#if form?.notFound}
		<div class="row">
			<div class="error">
				<p class="text">Unknown User<br />please register first</p>
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
		<div class="row"><Button type="submit">Log In</Button></div>
	</form>
	<div class="row text">
		<p>or<br />Do you need an <a href={`/signIn?redirect=${redirect}`}>Account</a>?</p>
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
