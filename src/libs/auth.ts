import { missingSecretError } from '@errors/foppa';
import * as jwt from 'jsonwebtoken';

const issuer = 'foppa';

export const createSessionId = (username: string, role:FoppaRole, secret: string) =>{
    if(!secret){
        throw missingSecretError()
    }
    return jwt.sign({ username, role }, secret, {
        subject: username,
        expiresIn: '30m',
        audience: username,
        issuer: issuer,
    })};

export const verifySession = (
    token: string,
    secret: string
): { valid: false } | { valid: true; username: string, role: FoppaRole } => {
    try {
        const res = jwt.verify(token, secret, { issuer, complete: true });
        let username = '';
        let role = '';
        if (typeof res.payload === 'string') {
            const body = JSON.parse(res.payload)
            username = body.username;
            role = body.role;
        } else {
            username = res.payload.username;
            role = res.payload.role
        }
        return {
            valid: true,
            username,
            role: role as FoppaRole
        };
    } catch (err) {
        return { valid: false };
    }
};

export class AuthToken {
    token = ''
    username = ''
    role = 'user'
    constructor(token: string){
        this.token = token;
        const res = jwt.decode(token)
        if (typeof res === 'string') {
            const body = JSON.parse(res)
            this.username = body.username;
            this.role = body.role as FoppaRole;
        } else {
            this.username = res.username;
            this.role = res.role as FoppaRole
        }
    }
}
