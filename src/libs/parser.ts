export const toUFunctionId = (username: string, functionId: string) => (`${username}/${functionId}`);

export const parseUFunctionId = (uFunctionId: string): [string, string] => {
    if (uFunctionId.search('/')) {
        return uFunctionId.split('/', 2) as [string, string]
    }
    throw `ERROR: unable this string as a uFunctionId ${uFunctionId}`
}




export const toPRegion = (provider: CloudProvider, region: string) => (
    `${provider}/${region}`
)

export const parsePRegion = (pregion: string): [CloudProvider, string] => {
    if (pregion.search('/')) {
        return pregion.split('/', 2) as [CloudProvider, string]
    }
    throw `ERROR: unable to parse this string {${pregion}} as a pregion `
} 
