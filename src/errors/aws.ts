import type { LogGroup } from "@aws-sdk/client-cloudwatch-logs";


export const unableToFindLogGroup = (logGroups: LogGroup[]): never => {
    if (logGroups.length === 0) {
        throw new Error('ERROR: Found no Log Groups!')
    } else {
        throw new Error(`ERROR: Found multiple Log Groups!\n${logGroups.map(lg => lg.logGroupName).join(' ')}`)
    }
}


export const LogNotFound = (logIdentifier: LogIdentifier): never => {
    throw new Error(`ERROR: Log not Found!\n${logIdentifier}`)
}
