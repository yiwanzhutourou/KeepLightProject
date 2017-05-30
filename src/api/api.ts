import { Address, Book, CODE_SUCCESS, Callback, MapData, Result } from './interfaces'
import {
    addAddressApi,
    getAddressApi,
    getUserIntroApi,
    removeAddressApi,
    setUserIntroApi,
} from '../test/backend'
import { addBookApi, bindUserApi, checkUserApi, getBookApi, getBookInfoApi, getMarkersOnMapApi, removeBookByIdApi, searchBooksApi } from '../test/backend'

import { showErrDialog } from '../utils/utils'

const BASE_URL = 'http://127.0.0.1/api/'

const USER_INFO_KEY = 'user_info'
const TOKEN_KEY = 'user_token'

let userInfo = null
export const setUserInfo = (info) => {
    userInfo = info
    wx.setStorage({ key: USER_INFO_KEY, data: info })
}

export const getUserInfo = () => {
    if (userInfo === null) {
        userInfo = wx.getStorageSync(USER_INFO_KEY)
    }
    return userInfo
}

let userToken: string = ''
export const setUserToken = (newToken: string) => {
    userToken = newToken
    wx.setStorage({ key: TOKEN_KEY, data: newToken })
}

export const getUserToken = () => {
    if (userToken === '') {
        userToken = wx.getStorageSync(TOKEN_KEY)
    }
    return userToken
}

export const login = (cb: (userInfo: any) => void) => {
    wx.login({
        success: (data) => {
            if (data && data.code) {
                wx.getUserInfo({
                    success: (res) => {
                        let info = res ? res.userInfo : null
                        bindUser(data.code, (token: string) => {
                            if (token) {
                                setUserToken(token)
                                setUserInfo(info)
                                cb(userInfo)
                            }
                        }, (failure) => {
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
        },
    })
}

export const getUrl = (path: string) => {
    return BASE_URL + path
}

export const buildUrlParam = (param: any, key?: string) => {
    if (param === null) {
        return ''
    }
    let result = ''
    let t = typeof param
    if (t === 'string' || t === 'number' || t === 'boolean') {
        result += '&' + key + '=' + encodeURIComponent(param)
    } else {
        Object.keys(param).map((pKey) => {
            let k = key == null ? pKey : key + (param instanceof Array ? '[' + pKey + ']' : '.' + pKey)
            result += buildUrlParam(param[pKey], k)
        })
    }

    if (result.length > 0) {
        result = '?' + result.substring(1, result.length)
    }
    return result
}

export const bindUser = (code: string, success: (token: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.login') + buildUrlParam({
        code: code,
    })

    get(url, (result: Result) => {
        success(result.data ? result.data.result : '')
    }, failure)
}

export const setUserIntro = (intro: string, success: () => void, failure?: (res?: any) => void) => {
    if (!intro) {
        showErrDialog('不能设置空的简介')
        return
    }

    if (intro.length > 70) {
        showErrDialog('简介不能超过 70 个字')
        return
    }

    let url = getUrl('User.setInfo') + buildUrlParam({
        info: intro,
    })
    get(url, (result: Result) => {
        console.log(result)
        success()
    }, failure)
}

export const getUserIntro = (success: (info: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.info')
    get(url, (result: Result) => {
        console.log(result)
        success(result.data.result)
    }, failure)
}

export const addAddress = (address: Address, cb: Callback) => {
    let userToken = getUserToken()
    addAddressApi(userToken, address, cb)
}

export const removeAddress = (address: Address, cb: Callback) => {
    let userToken = getUserToken()
    removeAddressApi(userToken, address, cb)
}

export const getAddress = (cb: Callback) => {
    let userToken = getUserToken()
    getAddressApi(userToken, cb)
}

export const addBook = (book: Book, cb: Callback) => {
    let userToken = getUserToken()
    addBookApi(userToken, book, cb)
}

export const removeBook = (bookId: string, cb: Callback) => {
    let userToken = getUserToken()
    removeBookByIdApi(userToken, bookId, cb)
}

export const getBookList = (cb: Callback) => {
    let userToken = getUserToken()
    getBookApi(userToken, cb)
}

export const searchBooks = (key: string, cb: Callback) => {
    let userToken = getUserToken()
    searchBooksApi(userToken, key, cb)
}

export const getBookInfo = (isbn: string, cb: Callback) => {
    let userToken = getUserToken()
    getBookInfoApi(userToken, isbn, cb)
}

export const getMarkersOnMap = (data: MapData, cb: Callback) => {
    getMarkersOnMapApi(data, cb)
}

export const get = (url: string, success: Callback, failure?: (res?: any) => void) => {
    wx.request({
        url: url,
        method: 'GET',
        header: getRequestHeader(),
        success: (res) => {
            if (!res) {
                callbackFail(success, -1 , '')
                return
            }
            if (res.statusCode === 200) {
                callbackSuccess(success, res.data)
            } else {
                handleServerError()
                // TODO: get error message
                callbackFail(success, res.statusCode, '')
            }
        },
        fail: (e) => {
            if (failure) {
                handleClientError()
                failure(e)
            }
        },
    })
}

export const post = (url: string, param, success: Callback, failure: (res?: any) => void) => {
    wx.request({
        url: url,
        data: param,
        method: 'POST',
        header: getRequestHeader(),
        success: (res) => {
            // TODO: parse result
        },
        fail: (e) => {
            if (failure) {
                handleClientError()
                failure(e)
            }
        },
    })
}

const handleServerError = () => {
    // TODO: 服务器返回的错误这里统一弹窗提示
}

const handleClientError = () => {
    showErrDialog('无法获取数据，请检查您的网络状态')
}

const getRequestHeader = () => {
    // TODO: put token, hash in header
    return {
        'BOCHA-USER-TOKEN': getUserToken(),
    }
}

const callbackSuccess = (cb: Callback, data?: any) => {
    cb({
        success: true,
        statusCode: CODE_SUCCESS,
        errMsg: '',
        data: data,
    })
}

const callbackFail = (
        cb: Callback, statusCode: number, errMsg: string, data?: any) => {
    cb({
        success: false,
        statusCode: statusCode,
        errMsg: errMsg,
        data: data,
    })
}
