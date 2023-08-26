import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import { getService } from '$lib/backend';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }) => {
    const session = verifySession(getSessionId(cookies) ?? '');
    const url = new URL(request.url);
    if (!session.valid) {
        throw authRedirect(url);
    }
    const data = await getService<'function'>(
        `function/${session.username}/${url.pathname.split('/').pop()}`
    );
    console.log(data);
    return data;
};
