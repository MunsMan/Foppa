export default {
    type: 'object',
    properties: {
        zip_file: { type: 'string' },
        code: {
            type: 'object',
            properties: {
                bucket: { type: 'string' },
                key: { type: 'string' }
            }
        },
        role: { type: 'string' },
        runtime: { type: 'string' },
        functionName: { type: 'string' },
        region: { type: 'string' },
        handler: { type: 'string' }
    },
    required: [
        'functionName',
        'role',
        'runtime',
        'region',
    ]
} as const;
