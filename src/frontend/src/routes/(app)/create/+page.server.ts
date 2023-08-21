import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import { runtimes, regions } from '$lib/aws/constants';
import type { Actions } from './$types';

const validate = (text: string, allowed: string[]) => {
	if (text.length <= 0) {
		return { valid: false, text, message: 'This is required!' };
	}
	if (allowed.length === 0 || allowed.includes(text)) {
		return { valid: true, text, message: 'Valid' };
	}
	return { valid: false, text, message: 'Invalid Option' };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const session = verifySession(getSessionId(cookies) ?? '');
		if (!session.valid) {
			throw authRedirect(new URL(request.url));
		}
		const username = session.username;
		const data = await request.formData();
		const functionName = validate(data.get('functionName')?.toString() ?? '', runtimes);
		const runtime = validate(data.get('runtime')?.toString() ?? '', runtimes);
		const region = validate(data.get('regions')?.toString() ?? '', regions);
		const handler = validate(data.get('handler')?.toString() ?? '', []);
		const role = validate(data.get('role')?.toString() ?? '', []);
		const code = validate(data.get('code')?.toString() ?? '', []);
		if (
			!(
				functionName.valid &&
				runtime.valid &&
				region.valid &&
				handler.valid &&
				role.valid &&
				code.valid
			)
		) {
			return {
				status: 'validation',
				state: {
					functionName,
					runtime,
					region,
					handler,
					role,
					code
				}
			};
		}
		try {
			const response = await fetch(
				`https://hbx3q3qnp8.execute-api.us-east-1.amazonaws.com/create/${username}`,
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
						zip_file: code,
						username: 'test'
					})
				}
			);

			console.log(response);

			const body = await response.json();

			return {
				status: 'success',
				functionId: body.functionId
			};
		} catch (error) {
			return {
				status: 'error',
				message: 'Something went wrong\nPlease try it later again'
			};
		}
	}
} satisfies Actions;
