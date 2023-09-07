import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import { getService } from '$lib/backend';
import type { Action, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }) => {
	const session = verifySession(getSessionId(cookies) ?? '');
	const url = new URL(request.url);
	if (!session.valid) {
		throw authRedirect(url);
	}
	return await getService<'function'>(
		`function/${session.username}/${url.pathname.split('/').pop()}`
	);
};

export const actions = {
	default: async ({ cookies, request }) => {
		const session = verifySession(getSessionId(cookies) ?? '');
		if (!session.valid) {
			throw authRedirect(new URL(request.url));
		}
		const data = await request.formData();
		const payload = data.get('json') ?? '';
		// ToDo: need to check user input

		return {};
	}
} satisfies Action;
