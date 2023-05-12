export default {
    type: 'object',
    properties: {
        functionId: { type: 'string' }
    },
    required: [
        'functionId'
    ]
} as const;
