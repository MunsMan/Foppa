import { authRedirect, getSessionId, verifySession } from '$lib/auth';
import { getService } from '$lib/backend';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }) => {
    const session = verifySession(getSessionId(cookies) ?? '');
    if (!session.valid) {
        throw authRedirect(new URL(request.url));
    }
    const data = await getService<'functions'>(`function/${session.username}`);
    console.log(data);
    return data;
};
