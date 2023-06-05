export default {
    type: 'object',
    properties: {
        uFunctionId: { type: 'string' },
        pregion: { type: 'string' },
        executionId: { type: 'string' },
        result: { type: 'string' },
        executionStart: { type: 'string' },
        executionEnd: { type: 'string' },
    },
    required: [
        'pregion', 'executionId', 'executionStart', 'executionEnd'
    ]
}
