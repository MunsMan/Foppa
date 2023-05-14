jest.mock('@libs/dynamodb', () => {
    return {
        getValue: jest.fn(async (tablename: string, params: any): Promise<FunctionExecutionCounterValue> => {
            expect(tablename).toBe('FunctionExecutionCounter')
            expect(params.username).toBeDefined()
            expect(params.functionId).toBeDefined()
            return {
                username: params.username,
                functionId: params.functionId,
                executionCounter: 1
            }
        }),
        incrValue: jest.fn(async (tablename: string, params: any, key: string) => {
            expect(tablename).toBe('FunctionExecutionCounter')
            expect(params.username).toBeDefined()
            expect(params.functionId).toBeDefined()
            expect(key).toBe('executionCounter')
            return 2
        })
    }
})
jest.mock('@libs/message-queue', () => {
    return {
        sendMessage: jest.fn()
    }
})
import { main as firstResponder } from './handler';


test('test if function exists', async () => {
    const username = 'test'
    const functionId = 'test123'
    await firstResponder({ pathParameters: { username, functionId } } as any, {} as any, {} as any)
})

