export const pattern = {
    'wechat': /^[a-zA-Z\d_]{5,}$/,
    'qq': /^[1-9]d{4,15}$/,
    'email': /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
}

export const verifyReg = (text: string, patternName: string) => {
    let pat = pattern[patternName]
    if (pat) {
        return pat.test(text)
    }

    return false
}
