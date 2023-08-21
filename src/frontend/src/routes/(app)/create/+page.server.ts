import { authRedirect, getSessionId, verifySession } from '$lib/auth';
		const session = verifySession(getSessionId(cookies) ?? '');
