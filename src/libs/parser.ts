export const toUFunctionId = (username: string, functionId: string) => (`${username}/${functionId}`);

export const parseUFunctionId = (uFunctionId: string): [string, string] => {
    if (uFunctionId.search('/')) {
        return uFunctionId.split('/', 2) as [string, string]
    }
    throw `ERROR: unable this string as a uFunctionId ${uFunctionId}`
}
