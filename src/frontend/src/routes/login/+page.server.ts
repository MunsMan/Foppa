import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

import jwt from 'jsonwebtoken';

const secret = 'test';

const createSessionId = (username: string) =>
	jwt.sign({ username }, secret, {
		subject: username,
		expiresIn: '30m',
		audience: username
	});

const hash = (password: string) => {
	return password;
};

const getUser = async (username: string | undefined) => {
	if (username === 'foppa') {
		return {
			password: 'abc',
			username: 'foppa'
		};
	}
	return undefined;
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';
		const user = await getUser(username?.toString());
		if (!user) {
			return fail(400, { username, notFound: true });
		}
		if (user.password !== hash(password)) {
			return fail(400, { username, wrong: true });
		}
		const sessionId = createSessionId(username);
		cookies.set('sessionId', sessionId);
		throw redirect(303, '/');
	}
} satisfies Actions;
