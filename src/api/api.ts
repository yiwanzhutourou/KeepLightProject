import { Address, Book, BorrowHistory, BorrowRequest, CODE_SUCCESS, DEFAULT_PAGE_SIZE, HomepageData, MapData, Markers, Result, UserContact, UserInfo } from './interfaces'
import { showConfirmDialog, showDialog, showErrDialog } from '../utils/utils'

// const BASE_URL = 'https://cuiyi.mozidev.me/api/'
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
                        if (wx.openSetting) {
                            showConfirmDialog('授权提醒',
                                '无法获取您的微信公开信息，您将不能创建书房、借阅图书等。是否重新授权？',
                                (confirm) => {
                                    if (confirm) {
                                        wx.openSetting({
                                            success: (authRes: any) => {
                                                if (authRes.authSetting && authRes.authSetting['scope.userInfo']) {
                                                    login((result) => {
                                                        if (result) {
                                                            showDialog('授权成功')
                                                        }
                                                    })
                                                }
                                            },
                                        })
                                    }
                                })
                        } else {
                            showErrDialog('无法获取您的微信公开信息，您将不能创建书房、借阅图书等。请您重新安装有读书房小程序并授权。')
                        }
                    },
                })
            }
        },
    })
}

export const getUrl = (path: string) => {
    return BASE_URL + path
}

const buildUrlParam = (param: any, key?: string) => {
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

    return result
}

const getUrlParam = (param: any, key?: string) => {
    let result = buildUrlParam(param, key)
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

export const getHomepageData = (userId: string, success: (info: HomepageData) => void, failure?: (res?: any) => void) => {
    if (userId) {
        let url = getUrl('User.getHomepageData') + getUrlParam({
            userId: userId,
        })
        get(url, success, failure)
    } else {
        checkLogin(() => {
            let url = getUrl('User.getHomepageData')
            get(url, success, failure)
        }, failure)
    }
}

export const getMyUserInfoFromServer = (success: (info: UserInfo) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getUserInfo')
    get(url, success, failure)
}

export const getUserInfoFromServer = (userId: string, success: (info: UserInfo) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getUserInfo') + getUrlParam({
        userId: userId,
    })
    get(url, success, failure)
}

export const setUserIntro = (intro: string, success: () => void, failure?: (res?: any) => void) => {
    if (intro.length > 70) {
        showErrDialog('简介不能超过 70 个字')
        return
    }

    checkLogin(() => {
        let url = getUrl('User.setInfo')
        post(url, {'info': intro}, success, failure)
    }, failure)
}

export const getUserIntro = (success: (info: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.info')
        get(url, success, failure)
    }, failure)
}

export const getOtherUserIntro = (userId: string, success: (info: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.info') + getUrlParam({
        userId: userId,
    })
    get(url, success, failure)
}

export const getUserContact = (success: (contact: UserContact) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getUserContact')
        post(url, [], success, failure)
    }, failure)
}

export const getUserContactByRequest = (requestId: number, success: (contact: UserContact) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getUserContactByRequest')
        post(url, {'requestId': requestId }, success, failure)
    }, failure)
}

export const setUserContact = (name: string, contact: string, success: (contact: UserContact) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.setUserContact')
        post(url, {
            'name': name,
            'contact': contact,
        }, success, failure)
    }, failure)
}

export const addAddress = (address: Address, success: (name: string) => void,
                            failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.addAddress')
        post(url, {
            'name': address.name,
            'detail': address.detail,
            'latitude': address.latitude,
            'longitude': address.longitude,
        }, success, failure)
    }, failure)
}

export const removeAddress = (id: number, success: (id: number) => void,
                                failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.removeAddress')
        post(url, { 'id': id }, success, failure)
    }, failure)
}

export const getAddress = (success: (addresses: Array<Address>) => void,
                            failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getMyAddress')
        get(url, success, failure)
    }, failure)
}

export const addBook = (isbn: string, success: (isbn: string) => void,
                        failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.addBook')
        post(url, { 'isbn': isbn }, success, failure)
    }, failure)
}

export const removeBook = (isbn: string, success: (isbn: string) => void,
                            failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.removeBook')
        post(url, { 'isbn': isbn }, success, failure)
    }, failure)
}

export const getBookList = (userId: string, success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    if (userId) {
        let url = getUrl('User.getUserBooks') + getUrlParam({
            userId: userId,
        })
        get(url, success, failure)
    } else {
        checkLogin(() => {
            let url = getUrl('User.getMyBooks')
            get(url, success, failure)
        }, failure)
    }
}

export const getOtherUserBookList = (userId: string, success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('User.getUserBooks') + getUrlParam({
        userId: userId,
    })
    get(url, success, failure)
}

export const searchBooks = (
        key: string, page: number, count = DEFAULT_PAGE_SIZE,
        success?: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Book.search') + getUrlParam({
        key: key,
        count: count,
        page: page,
    })
    get(url, success, failure)
}

export const getBookInfo = (isbn: string, success: (books: Array<Book>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Book.getBookByIsbn') + getUrlParam({
        isbn: isbn,
    })
    get(url, success, failure)
}

export const borrowBook = (toUser: string, isbn: string, formId: string, success: () => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.borrowBook')
        post(url, { 'toUser': toUser, 'isbn': isbn, 'formId': formId }, success, failure)
    }, failure)
}

export const updateRequest = (requestId: number, status: number, success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.updateBorrowRequest')
        post(url, { 'requestId': requestId, 'status': status }, success, failure)
    }, failure)
}

export const getBorrowHistory = (success: (result: Array<BorrowHistory>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getBorrowHistory')
        get(url, success, failure)
    }, failure)
}

export const getMyApprovedRequest = (success: (result: Array<BorrowHistory>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getMyApprovedRequest')
        get(url, success, failure)
    }, failure)
}

export const getBorrowRequest = (success: (result: Array<BorrowRequest>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getBorrowRequest')
        get(url, success, failure)
    }, failure)
}

export const getBorrowRequestCount = (success: (result: number) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getBorrowRequestCount')
        get(url, success, failure)
    }, failure)
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
    let url = 'https://api.douban.com/v2/book/' + isbn
    // 特殊处理一下老数据，豆瓣的id不可能是978开头的
    if (isbn.indexOf('978') === 0) {
        url = 'https://api.douban.com/v2/book/isbn/' + isbn
    }
    wx.request({
        url: url,
        method: 'GET',
        header: {
            'Content-Type': 'json',
        },
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

export const rights = (success: (result: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Youdu.rights')
    get(url, success, failure)
}

export const legals = (success: (result: string) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Youdu.legals')
    get(url, success, failure)
}

export const get = (url: string, success?: (res: any) => void, failure?: (res?: any) => void) => {
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
                if (success) {
                    success(res.data ? res.data.result : null)
                }
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
            showErrDialog('无法获取数据，请检查您的网络状态')
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

// TODO 所有需要登录的接口都要调这个函数，好蠢，当时结构没设计好
const checkLogin = (success: () => void, failure?: (res?: any) => void) => {
    if (getUserToken()) {
        success()
    } else {
        login((result) => {
            if (result) {
                success()
            } else {
                if (failure) {
                    failure()
                }
            }
        })
    }
}
