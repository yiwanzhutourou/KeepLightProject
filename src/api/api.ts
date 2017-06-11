import { Address, Book, BorrowHistory, CODE_SUCCESS, MapData, Markers, Result, UserContact, UserInfo } from './interfaces'

import { showErrDialog } from '../utils/utils'

const BASE_URL = 'http://192.168.0.102/api/'

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
                        let info: any = res ? res.userInfo : null
                        if (info === null) {
                            setUserToken('')
                            setUserInfo(null)
                            cb(null)
                            return
                        }
                        bindUser(data.code, info.nickName, info.avatarUrl, (token: string) => {
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

export const bindUser = (code: string, nickname: string, avatar: string, success: (token: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.login')

    post(url, {
        'code': code,
        'nickname': nickname,
        'avatar': avatar,
    }, success, failure)
}

export const getUserInfoFromServer = (token: string, success: (info: UserInfo) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getUserInfo') + buildUrlParam({
        userToken: token,
    })
    get(url, success, failure)
}

export const setUserIntro = (intro: string, success: () => void, failure?: (res?: any) => void) => {
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

export const getOtherUserIntro = (token: string, success: (info: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.info') + buildUrlParam({
        userToken: token,
    })
    get(url, success, failure)
}

export const getUserContact = (success: (contact: UserContact) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getUserContact')
    post(url, [], success, failure)
}

export const setUserContact = (name: string, contact: string, success: (contact: UserContact) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.setUserContact')
    post(url, {
        'name': name,
        'contact': contact,
    }, success, failure)
}

export const addAddress = (address: Address, success: (name: string) => void,
                            failure?: (res?: any) => void) => {
    let url = getUrl('User.addAddress')
    post(url, {
        'name': address.name,
        'detail': address.detail,
        'latitude': address.latitude,
        'longitude': address.longitude,
    }, success, failure)
}

export const removeAddress = (id: number, success: (id: number) => void,
                                failure?: (res?: any) => void) => {
    let url = getUrl('User.removeAddress')
    post(url, { 'id': id }, success, failure)
}

export const getAddress = (success: (addresses: Array<Address>) => void,
                            failure?: (res?: any) => void) => {
    let url = getUrl('User.getMyAddress')
    get(url, success, failure)
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

export const getOtherUserBookList = (token: string, success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getUserBooks') + buildUrlParam({
        userToken: token,
    })
    get(url, success, failure)
}

export const searchBooks = (key: string, success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Book.search') + buildUrlParam({
        key: key,
    })
    get(url, success, failure)
}

export const getBookInfo = (isbn: string, success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Book.getBookByIsbn') + buildUrlParam({
        isbn: isbn,
    })
    get(url, success, failure)
}

export const borrowBook = (toUser: string, isbn: string, formId: string, success: () => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.borrowBook')
    post(url, { 'toUser': toUser, 'isbn': isbn, 'formId': formId }, success, failure)
}

export const getBorrowHistory = (success: (result: Array<BorrowHistory>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getBorrowHistory')
    get(url, success, failure)
}

export const getMarkers = (success: (books: Array<Markers>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Map.getMarkers')
    get(url, (result) => {
        let markers = Array<Markers>()
        if (result) {
            result.forEach((marker) => {
                markers.push({
                    id: marker.id,
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    iconPath: '/resources/img/icon_map_location.png',
                    width: 60,
                    height: 60,
                })
            })
        }
        success(markers)
    }, failure)
}

export const getBookDetails = (isbn: string, success: (result: any) => void, failure?: (res?: any) => void) => {
    let url = 'https://api.douban.com/v2/book/isbn/' + isbn
    wx.request({
        url: url,
        method: 'GET',
        success: (res) => {
            console.log(res)
            if (!res) {
                return
            }
            if (res.statusCode === 200) {
                success(res.data ? res.data : null)
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

export const get = (url: string, success: (res: any) => void, failure?: (res?: any) => void) => {
    wx.request({
        url: url,
        method: 'GET',
        header: getRequestHeader(),
        success: (res) => {
            console.log(res)
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

export const post = (url: string, param, success: (res: any) => void, failure?: (res?: any) => void) => {
    wx.request({
        url: url,
        data: param,
        method: 'POST',
        header: getRequestHeader(),
        success: (res) => {
            console.log(res)
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
