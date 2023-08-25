import * as jwt from 'jsonwebtoken';

const secret = 'test';
const issuer = 'foppa';

export const createSessionId = (username: string) =>
    jwt.sign({ username }, secret, {
        subject: username,
        expiresIn: '30m',
        audience: username,
        issuer: issuer,
    });

export const verifySession = (
    token: string
): { valid: false } | { valid: true; username: string } => {
    try {
        const res = jwt.verify(token, secret, { issuer, complete: true });
        let username = '';
        if (typeof res.payload === 'string') {
            username = JSON.parse(res.payload).username;
        } else {
            username = res.payload.username;
        }
        return {
            valid: true,
            username,
        };
    } catch (err) {
        return { valid: false };
    }
};
