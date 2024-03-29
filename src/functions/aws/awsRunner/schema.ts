export default {
    type: 'object',
    properties: {
        uFunctionId: { type: 'string' },
        pregion: { type: 'string' },
        executionId: { type: 'string' },
        functionName: { type: 'string' },
        payload: { type: 'string' }
    },
    required: [
        'functionName', 'uFunctionId', 'pregion', 'executionId'
    ]
} as const;
