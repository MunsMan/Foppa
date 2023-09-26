import { regions, runtimes } from '@consts/aws';
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
        runtime: { type: 'string', enum: runtimes },
        functionName: { type: 'string' },
        regions: {
            type: 'array',
            items: {
                type: 'string',
                enum: regions,
            },
        },
        handler: { type: 'string' },
        memorySize: { type: 'number', minimum: 128 },
        timeout: { type: 'number', minimum: 1, maximum: 900 },
        env: {
            type: 'object',
            additionalProperties: { type: 'string' },
        },
    },
    required: ['functionName', 'runtime', 'regions', 'handler'],
} as const;
