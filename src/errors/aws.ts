import type { LogGroup } from "@aws-sdk/client-cloudwatch-logs";


const exit = (code: number = 1): never => {
    process.exit(code)
}

export const unableToFindLogGroup = (logGroups: LogGroup[]): never => {
    if (logGroups.length === 0) {
        console.error('ERROR: Found no Log Groups!')
    } else {
        console.error(`ERROR: Found multiple Log Groups!\n${logGroups.map(lg => lg.logGroupName).join(' ')}`)
    }
    return exit()
}
