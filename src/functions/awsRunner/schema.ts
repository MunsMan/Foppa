export default {
    type: 'object',
    properties: {
        functionName: { type: 'string' },
        payload: { type: 'string' }
    },
    required: [
        'functionId'
    ]
} as const;
