import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import { getService, type FunctionResponse } from '$lib/backend';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }): Promise<FunctionResponse> => {
    const session = verifySession(getSessionId(cookies) ?? '');
    const url = new URL(request.url);
    if (!session.valid) {
        throw authRedirect(url);
    }
    return getService<'function'>(`function/${session.username}/${url.pathname.split('/').pop()}`);
};
