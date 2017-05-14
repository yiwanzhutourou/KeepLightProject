// TODO: 挪到api里
export const SERVER_HOST = 'https://www.abc.com'

// user相关
export const USER_LOGIN_URL = '/api/User.login'

const USER_INFO_KEY = 'user_info'
const TOKEN_KEY = 'user_token'

let userInfo = null
export function setUserInfo(info) {
    userInfo = info;
    wx.setStorage({ key: USER_INFO_KEY, data: info });
}

export const getUserInfo = () => {
    if (userInfo === null) {
        userInfo = wx.getStorageSync(USER_INFO_KEY)
    }
    return userInfo
}

let token: string = ''
export function setUserToken(newToken: string) {
    token = newToken;
    wx.setStorage({ key: TOKEN_KEY, data: newToken });
}

export const getUserToken = () => {
    if (token === '') {
        token = wx.getStorageSync(TOKEN_KEY)
    }
    return token
}

type UserLoginParam = {
    code: any,
    userInfo: any,
}

export const login = (cb: (userInfo: any) => void) => {
    wx.login({
        success: (data) => {
            if (data && data.code) {
                wx.getUserInfo({
                    success: (res) => {
                        let userInfo = res ? res.userInfo : null
                        userLogin({
                            code: data.code,
                            userInfo: userInfo,
                        }, success => {
                            if (success && success.data) {
                                // hard code test
                                const token = success.data.openid + success.data.session_key
                                setUserToken(token)
                                setUserInfo(userInfo)
                                cb(userInfo)
                            }
                        }, failure => {
                            setUserToken('')
                            setUserInfo(null)
                            cb(null)
                        })
                    },
                    fail: () => {
                        setUserToken('')
                        setUserInfo(null)
                        cb(null)
                    },
                })
            }
        }
    })
}

export const userLogin = (param: UserLoginParam, success, fail?, complete?) => {
    // postRequest(
    //     SERVER_HOST + USER_LOGIN_URL,
    //     param,
    //     success => {
    //         console.log(success)
    //     }
    // )
    getRequest(
        'https://api.weixin.qq.com/sns/jscode2session' 
            + '?appid='
            + '&secret='
            + '&js_code=' + param.code
            + '&grant_type=authorization_code',
        successRes => {
            success(successRes)
        },
        failRes => {
            if (fail) fail(failRes)
        }
    )
}

export const getRequest = (url, success, failure?, complete?) => {
    wx.request({
        url: url,
        method: 'GET',
        header: getRequestHeader(),
        success: function (res) {
            success(res);
        },
        fail: function (e) {
            if (failure) failure(e)
        },
        complete: function (e) {
            if (complete) complete(e);
        }
    })
}

export const postRequest = (url, param, success, failure?, complete?) => {
    wx.request({
        url: url,
        data: param,
        method: 'POST',
        header: getRequestHeader(),
        success: function (res) {
            success(res);
        },
        fail: function (e) {
            if (failure) failure(e)
        },
        complete: function (e) {
            if (complete) complete(e);
        }
    })
}

const getRequestHeader = () => {
    return {}
}