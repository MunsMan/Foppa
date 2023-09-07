import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import { runtimes, regions } from '$lib/aws/constants';
import { postService } from '$lib/backend';
import type { Actions } from './$types';

const validate = (text: string, allowed: readonly string[]) => {
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
		const all = Object.fromEntries(data);
		console.log((all.lambda as File).name);
		const lambda = all.lambda as File;
		const functionName = validate(data.get('functionName')?.toString() ?? '', []);
		const runtime = validate(data.get('runtime')?.toString() ?? '', runtimes);
		const region = validate(data.get('region')?.toString() ?? '', regions);
		const handler = validate(data.get('handler')?.toString() ?? '', []);
		const role = validate(data.get('role')?.toString() ?? '', []);
		const code = validate(lambda.name ?? '', []);
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
			console.log('Invalid', 'validation', {
				functionName,
				runtime,
				region,
				handler,
				role,
				code
			});
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
			const base64_file = Buffer.from(await lambda.arrayBuffer()).toString('base64');
			console.log(base64_file, role.text);
			const response = await postService<'create'>(`create/${username}`, {
				region: region.text,
				runtime: runtime.text,
				role: role.text,
				handler: handler.text,
				zip_file: base64_file,
				functionName: functionName.text
			});
			console.log(response);

			return {
				status: 'success',
				functionId: response.functionId
			};
		} catch (error) {
			console.log(error);
			return {
				status: 'error',
				message: 'Something went wrong\nPlease try it later again'
			};
		}
	}
} satisfies Actions;
