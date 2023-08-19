<script lang="ts">
	import type { ActionData } from './$types';

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
			<label for="username">
				Username
				<input id="username" type="text" name="username" />
			</label>
		</div>
		<div class="row">
			<label for="password">
				Password
				<input id="password" type="password" name="password" />
			</label>
		</div>
		<div class="row"><button type="submit" class="button">Log In</button></div>
	</form>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}
	.row {
		margin: 2vh;
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
