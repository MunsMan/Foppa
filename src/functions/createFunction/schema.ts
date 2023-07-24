export default {
    type: 'object',
    properties: {
        zip_file: { type: 'Uint8Array' },
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
        region: { type: 'string' }
    },
    required: [
        'functionName',
        'role',
        'runtime'
        'region'
    ]
} as const;
