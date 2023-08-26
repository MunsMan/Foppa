import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSessionId, setSessionId } from '$lib/auth';
import { postService } from '$lib/backend';

type ValidationStatus = 'created' | 'alreadyExists' | 'error';

const createUser = async (username: string, password: string): Promise<ValidationStatus> => {
    try {
        const data = await postService<'signIn'>('signIn', { username, password });
        return data.status;
    } catch (error) {
        return 'error';
    }
};

export const actions = {
    default: async ({ cookies, request }) => {
        const url = new URL(request.url);
        const source: string = url.searchParams.get('redirect') ?? '/';
        const data = await request.formData();
        console.log(data);
        const username = data.get('username')?.toString() ?? '';
        const password = data.get('password')?.toString() ?? '';
        const password2 = data.get('password-2')?.toString() ?? '';
        if (password !== password2) {
            return fail(400, { username, status: 'notEqual' });
        }
        const status = await createUser(username, password);
        if (status !== 'created') {
            return fail(400, { username, status });
        }
        const sessionId = createSessionId(username);
        setSessionId(cookies, sessionId);
        throw redirect(303, source);
    }
} satisfies Actions;
