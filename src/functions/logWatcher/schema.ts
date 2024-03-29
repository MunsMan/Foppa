import { regions } from '@consts/aws';
export default {
    type: 'object',
    properties: {
        region: {
            type: 'string',
            enum: [...regions],
        },
        functionName: { type: 'string' },
        requestIds: { type: 'array', items: { type: 'string' } },
        executionStart: { type: 'number' },
        executionEnd: { type: 'number' },
    },
    required: ['region', 'functionName', 'requestIds'],
} as const;
