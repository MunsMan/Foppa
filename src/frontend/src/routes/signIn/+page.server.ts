import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSessionId, setSessionId } from '$lib/auth';
import { BACKEND_URL } from '$env/static/private';

type ValidationStatus = 'created' | 'alreadyExists' | 'error' | 'notEqual';

const createUser = async (username: string, password: string): Promise<ValidationStatus> => {
    try {
        const response = await fetch(`${BACKEND_URL}/signIn`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        return data.created ? 'created' : 'alreadyExists';
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
