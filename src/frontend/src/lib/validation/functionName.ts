export const functionNameValidation: ValidationFunction = (text: string, _allowed: string[]) => {
    if (text.length === 0) {
        return [false, 'This is required']
    }
    if (text.includes(' ')) {
        return [false, 'FunctionName can\'t contain spaces']
    }
    if (is_numeric(text[0])) {
        return [false, 'A Function Name can\' start with a number']
    }
    return [true, 'Valid']
}

function is_numeric(str: string) {
    return /^\d+$/.test(str);
}
