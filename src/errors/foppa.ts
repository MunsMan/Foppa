export const missingSecretError = () => {
    Error('[ERROR] - undefind secret key!\nUnable to create SessionId.')
}

export const authorizedButNotAllowed = () => {
    return {
        statusCode: 403,
        body: 'You are identified, but not authorized for that request!',
    };
}
