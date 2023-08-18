<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;

	$: console.log(form);
</script>

<div class="container">
	<h1 class="text">Login</h1>
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
		<div class="row"><button>LogIn</button></div>
	</form>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	.text {
		text-align: center;
	}
</style>
