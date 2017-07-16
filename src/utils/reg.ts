export const pattern = {
    'wechat': /^[a-zA-Z\d_]{5,}$/,
    'qq': /^[0-9]{4,15}$/,
    'email': /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    'mobile': /^1[34578]\d{9}$/,
    'smscode': /^\d{6}$/,
}

export const verifyReg = (text: string, patternName: string) => {
    let pat = pattern[patternName]
    if (pat) {
        return pat.test(text)
    }

    return false
}
