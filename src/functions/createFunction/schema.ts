import { regions } from '@consts/aws';
export default {
    type: 'object',
    properties: {
        zip_file: { type: 'string' },
        code: {
            type: 'object',
            properties: {
                bucket: { type: 'string' },
                key: { type: 'string' },
            },
        },
        role: { type: 'string' },
        runtime: { type: 'string' },
        functionName: { type: 'string' },
        region: {
            enum: [...regions],
        },
        handler: { type: 'string' },
    },
    required: ['functionName', 'role', 'runtime', 'region'],
} as const;
