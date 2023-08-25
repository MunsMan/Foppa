import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSessionId, setSessionId } from '$lib/auth';
import { BACKEND_URL } from '$env/static/private';

type ValidationStatus = 'valid' | 'wrong' | 'notFound';

const validate = async (username: string, password: string): Promise<ValidationStatus> => {
	try {
		const response = await fetch(`${BACKEND_URL}/login`, {
			method: 'POST',
			body: JSON.stringify({ username, password }),
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await response.json();
		return data.status ?? 'wrong';
	} catch (error) {
		return 'wrong';
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
		const valid = await validate(username, password);
		if (valid === 'notFound') {
			return fail(400, { username, notFound: true });
		}
		if (valid === 'wrong') {
			return fail(400, { username, wrong: true });
		}
		const sessionId = createSessionId(username);
		setSessionId(cookies, sessionId);
		throw redirect(303, source);
	}
} satisfies Actions;
