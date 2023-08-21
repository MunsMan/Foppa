import type { LayoutServerLoad } from './$types';
import { authRedirect, verifySession } from '$lib/auth';

export const load: LayoutServerLoad = async ({ cookies, request }) => {
	const url = new URL(request.url);
	if (url.pathname === '/login') {
		return {};
	}
	const token = cookies.get('sessionId');
	if (!token) {
		throw authRedirect(url);
	}
	const session = verifySession(token);

	if (!session.valid) {
		throw authRedirect(url);
	}
	return {
		username: session.username
	};
};
