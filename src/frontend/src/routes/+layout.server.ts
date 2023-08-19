import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { verifySession } from '$lib/auth';

const toLogin = (url: URL) => redirect(303, `/login?redirect=${url.pathname}`);

export const load: LayoutServerLoad = async ({ cookies, request }) => {
    const url = new URL(request.url);
    if (url.pathname === '/login') {
        return {};
    }
    const token = cookies.get('sessionId');
    if (!token) {
        throw toLogin(url);
    }
    const session = verifySession(token);

    if (!session.valid) {
        throw toLogin(url);
    }
    return {
        username: session.username
    };
};
