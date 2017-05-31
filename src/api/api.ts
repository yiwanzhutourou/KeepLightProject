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

    get(url, success, failure)
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

    let url = getUrl('User.setInfo')
    post(url, {'info': intro}, success, failure)
}

export const getUserIntro = (success: (info: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.info')
    get(url, success, failure)
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

export const addBook = (isbn: string, success: (isbn: string) => void,
                        failure?: (res?: any) => void) => {
    let url = getUrl('User.addBook')
    post(url, { 'isbn': isbn }, success, failure)
}

export const removeBook = (isbn: string, success: (isbn: string) => void,
                            failure?: (res?: any) => void) => {
    let url = getUrl('User.removeBook')
    post(url, { 'isbn': isbn }, success, failure)
}

export const getBookList = (success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getMyBooks')
    get(url, success, failure)
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

export const get = (url: string, success: (res: any) => void, failure?: (res?: any) => void) => {
    wx.request({
        url: url,
        method: 'GET',
        header: getRequestHeader(),
        success: (res) => {
            if (!res) {
                return
            }
            if (res.statusCode === 200) {
                console.log(res.data)
                success(res.data ? res.data.result : null)
            } else {
                handleServerError(res.data)
                if (failure) {
                    failure(res)
                }
            }
        },
        fail: (e) => {
            if (failure) {
                failure(e)
            }
        },
    })
}

export const post = (url: string, param, success: (res: any) => void, failure?: (res?: any) => void) => {
    wx.request({
        url: url,
        data: param,
        method: 'POST',
        header: getRequestHeader(),
        success: (res) => {
            if (!res) {
                return
            }
            if (res.statusCode === 200) {
                success(res.data ? res.data.result : null)
            } else {
                handleServerError(res.data)
                if (failure) {
                    failure(res)
                }
            }
        },
        fail: (e) => {
            if (failure) {
                failure(e)
            }
        },
    })
}

const handleServerError = (response: any) => {
    if (response && response.error) {
        if (response.message) {
            showErrDialog(response.message)
        } else {
            showErrDialog('服务器发生错误了，请稍后重试~')
        }
    }
}

const getRequestHeader = () => {
    // TODO: put hash in header
    return {
        'BOCHA-USER-TOKEN': getUserToken(),
    }
}
