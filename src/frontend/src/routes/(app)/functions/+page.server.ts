import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ cookies, request }) => {
	const session = verifySession(getSessionId(cookies) ?? '');
	if (!session.valid) {
		throw authRedirect(new URL(request.url));
	}
	return {
		functions: [
			{ name: 'test123' },
			{ name: 'test123' },
			{ name: 'test123' },
			{ name: 'test123' },
			{ name: 'test123' },
			{ name: 'test123' }
		]
	};
};
