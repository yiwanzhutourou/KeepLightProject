import {
    Address,
    Book,
    BorrowHistory,
    BorrowRequest,
    CODE_SUCCESS,
    DEFAULT_PAGE_SIZE,
    HomepageData,
    MapData,
    Markers,
    Result,
    SearchResult,
    SearchUser,
    UserContact,
    UserInfo,
} from './interfaces'
import { CardDetail, ChatData, ChatListData, GuideData, LoginData, MinePageData, MyCardItem, SettingsData } from './interfaces'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog } from '../utils/utils'

// export const DEFAULT_BASE_URL = 'https://cuiyi.mozidev.me/api/'
export const DEFAULT_BASE_URL = 'http://127.0.0.1/api/'
export const TEST_BASE_URL = 'https://haribo.mozidev.me/api/'

const URL_KEY = 'url_key'
const USER_INFO_KEY = 'user_info'
const TOKEN_KEY = 'user_token'
const MOBILE_KEY = 'user_has_mobile'

let baseUrl = ''

export const getBaseUrl = () => {
    if (baseUrl === '') {
        baseUrl = wx.getStorageSync(URL_KEY)
        if (!baseUrl) {
            setBaseUrl(DEFAULT_BASE_URL)
        }
    }
    return baseUrl
}

export const setBaseUrl = (url: string) => {
    baseUrl = url
    wx.setStorage({ key: URL_KEY, data: baseUrl })
}

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

export const clearUserToken = () => {
    wx.removeStorageSync(TOKEN_KEY)
    wx.removeStorageSync(USER_INFO_KEY)
    wx.removeStorageSync(MOBILE_KEY)
    hasMobileBound = -1
    userToken = ''
    userInfo = null
}

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

let hasMobileBound: number = -1

export const setMobileBound = (bound: boolean) => {
    hasMobileBound = bound ? 1 : 0
    wx.setStorage({ key: MOBILE_KEY, data: hasMobileBound })
}

export const hasMobile = () => {
    if (hasMobileBound === -1) {
        hasMobileBound = wx.getStorageSync(MOBILE_KEY)
        if (!hasMobileBound) {
            hasMobileBound = 0
        }
    }
    return hasMobileBound === 1
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
                        bindUser(data.code, info.nickName, info.avatarUrl, (result: LoginData) => {
                            if (result && result.token) {
                                setUserToken(result.token)
                                setUserInfo(info)
                                setMobileBound(result.hasMobile)
                                cb({
                                    userInfo: userInfo,
                                    hasMobile: result.hasMobile,
                                })
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
                                '无法获取你的微信公开信息，你将不能创建书房、借阅图书等。是否重新授权？',
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
                            showErrDialog('无法获取你的微信公开信息，你将不能创建书房、借阅图书等。请你重新安装有读书房小程序并授权。')
                        }
                    },
                })
            }
        },
    })
}

export const getUrl = (path: string) => {
    return getBaseUrl() + path
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

export const bindUser = (code: string, nickname: string, avatar: string,
                        success: (result: LoginData) => void, failure?: (res?: any) => void) => {
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
        // 走到这肯定出bug了
    }
}

export const getMyHomepageData = (success: (info: HomepageData) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getHomepageData')
        get(url, success, failure)
    }, failure)
}

export const getGuideData = (success: (info: GuideData) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getGuideInfo')
        get(url, success, failure)
    }, failure)
}

export const getMapDetails = (userIds: string, success: (info: Array<SearchUser>) => void, failure?: (res?: any) => void) => {
    const url = getUrl('Map.getUserAddresses') + getUrlParam({ userIds })
    get(url, success, failure)
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
        get(url, success, failure)
    }, failure, false/* 不进行登录行为 */)
}

export const getSettingsData = (success: (data: SettingsData) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getSettingsData')
        get(url, success, failure)
    }, failure, false/* 不进行登录行为 */)
}

export const getMinePageData = (success: (data: MinePageData) => void, failure?: (res?: any) => void) => {  
    checkLogin(() => {
        let url = getUrl('User.getMinePageData')
        get(url, success, failure)
    }, failure, false/* 不进行登录行为 */)
}

export const getUserContactByRequest = (requestId: number, success: (contact: UserContact) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getUserContactByRequest')
        post(url, {'requestId': requestId }, success, failure)
    }, failure)
}

/**
 * 测试函数！！！！！ 
 */
export const clearUserData = (success: (result: string) => void, failure?: (res?: any) => void) => {
    if (!getUserToken()) {
        showErrDialog('本地没有token，暂时不能操作')
        hideLoading()
        return
    }
    let url = getUrl('Haribo.clearUser')
    post(url, [], success, failure)
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

export const borrowBookNew = (toUser: string, isbn: string, message: string, success: () => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Chat.borrowBook')
        post(url, { 'toUser': toUser, 'isbn': isbn, 'message': message }, success, failure)
    }, failure)
}

export const follow = (toUser: string, success: (result: string) => void,
        failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.follow')
        post(url, { 'toUser': toUser }, success, failure)
    }, failure)
}

export const unfollow = (toUser: string, success: (result: string) => void,
        failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.unfollow')
        post(url, { 'toUser': toUser }, success, failure)
    }, failure)
}

export const updateRequest = (requestId: number, status: number, success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.updateBorrowRequest')
        post(url, { 'requestId': requestId, 'status': status }, success, failure)
    }, failure)
}

export const newBookCard = (
        content: string, title: string, picUrl: string, bookIsbn: string,
        success: (id: number) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Card.insert')
        post(url, {
            'content': content,
            'title': title,
            'picUrl': picUrl,
            'bookIsbn': bookIsbn,
        }, success, failure)
    }, failure)
}

export const getCardById = (id: number,
        success: (result: CardDetail) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Card.getCardById') + getUrlParam({
            cardId: id,
        })
        get(url, success, failure)
    }, failure)
}

export const deleteCardById = (id: number,
        success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Card.delete') + getUrlParam({
            cardId: id,
        })
        get(url, success, failure)
    }, failure)
}

export const getMyCards = (
        success: (cards: Array<MyCardItem>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Card.getMyCards')
        get(url, success, failure)
    }, failure)
}

export const getCardListByUser = (userId: number,
        success: (cards: Array<MyCardItem>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Card.getUserCards') + getUrlParam({
            userId: userId,
        })
        get(url, success, failure)
    }, failure)
}

export const getBorrowHistory = (success: (result: Array<BorrowHistory>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getBorrowHistory')
        get(url, success, failure)
    }, failure)
}

export const getFollowings = (success: (result: Array<SearchUser>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getMyFollowings')
        get(url, success, failure)
    }, failure)
}

export const getFollowers = (success: (result: Array<SearchUser>) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getMyFollowers')
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

export const getChatList = (success: (data: ChatListData) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Chat.getChatList')
        get(url, success, failure)
    }, failure)
}

export const startChat = (otherId: number, count: number, page: number,
        success: (data: ChatData) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Chat.start') + getUrlParam({
            otherId: otherId,
            count: count,
            page: page,
        })
        get(url, success, failure)
    }, failure)
}

export const deleteChat = (otherId: number, timestamp: number,
        success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Chat.delete') + getUrlParam({
            otherId: otherId,
            timestamp: timestamp,
        })
        get(url, success, failure)
    }, failure)
}

export const sendMessage = (otherId: number, message: string,
        success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Chat.sendMessage') + getUrlParam({
            otherId: otherId,
            message: message,
        })
        get(url, success, failure)
    }, failure)
}

export const sendContact = (otherId: number,
        success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Chat.sendContact') + getUrlParam({
            otherId: otherId,
        })
        get(url, success, failure)
    }, failure)
}

export const getBorrowRequestCount = (success: (result: number) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.getBorrowRequestCount')
        get(url, success, failure)
    }, failure, false/* 不强制登录 */)
}

export const requestVerifyCode = (mobile: string, success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.requestVerifyCode') + getUrlParam({
            mobile: mobile,
        })
        get(url, success, failure)
    }, failure, true, true/* 验证短信当然不能要求人家已经绑了手机啦 */)
}

export const verifyCode = (mobile: string, code: string, success: (result: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('User.verifyCode') + getUrlParam({
            mobile: mobile,
            code: code,
        })
        get(url, success, failure)
    }, failure, true, true)
}

export const search = (keyword: string, latitude: number, longitude: number,
                      count: number, page: number,
                      success: (result: Array<SearchResult>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Search.books') + getUrlParam({
        keyword: keyword,
        latitude: latitude,
        longitude: longitude,
        count: count,
        page: page,
    })
    get(url, success, failure)
}

export const searchUsers = (keyword: string, latitude: number, longitude: number,
                      count: number, page: number,
                      success: (result: Array<SearchUser>) => void, failure?: (res?: any) => void) => {
    let url = getUrl('Search.users') + getUrlParam({
        keyword: keyword,
        latitude: latitude,
        longitude: longitude,
        count: count,
        page: page,
    })
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
                    width: 33,
                    height: 40,
                    isMergeMarker: false,
                })
            })
        }
        success(markers)
    }, failure)
}

export const getBookDetails = (isbn: string, success: (result: any) => void, failure?: (res?: any) => void) => {
    let url = 'https://api.douban.com/v2/book/' + isbn
    // 特殊处理一下老数据，豆瓣的id不可能是978开头的
    if (isbn && isbn.indexOf('978') === 0) {
        url = 'https://api.douban.com/v2/book/isbn/' + isbn
    }
    wx.request({
        url: url,
        method: 'GET',
        header: {
            'Content-Type': 'json',
        },
        success: (res) => {
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

export const getUploadToken = (success: (token: string) => void, failure?: (res?: any) => void) => {
    checkLogin(() => {
        let url = getUrl('Qiniu.getUploadToken')
        get(url, success, failure)
    }, failure)
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
        },
    })
}

const handleServerError = (response: any) => {
    if (response && response.error) {
        if (response.error === 2009) {
            // 单独处理未绑定手机号的情况
            showBindMobileDialog()
        } else if (response.message) {
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

export const checkLoginFirstLaunch = (success: () => void, failure?: () => void) => {
    if (getUserToken()) {
        if (hasMobile()) {
            success()
        } else {
            if (failure) {
                failure()
            }
        }
    } else {
        login((result) => {
            if (result && result.userInfo && result.hasMobile) {
                success()
            } else {
                if (failure) {
                    failure()
                }
            }
        })
    }
}

// TODO 所有需要登录的接口都要调这个函数，好蠢，当时结构没设计好
// 接口越写越复杂，=。=
const checkLogin = (success: () => void, failure?: (res?: any) => void, forceLogin = true, skipSms = false) => {
    if (getUserToken()) {
        if (hasMobile() || skipSms) {
            success()
        } else {
            if (forceLogin) {
                showBindMobileDialog()
            }
            if (failure) {
                failure()
            }
        }
    } else if (forceLogin) {
        login((result) => {
            if (result && result.userInfo && (result.hasMobile || skipSms)) {
                success()
            } else {
                if (failure) {
                    failure()
                }
                if (result && !result.hasMobile) {
                    showBindMobileDialog()
                }
            }
        })
    } else {
        if (failure) {
            failure()
        }
    }
}

const showBindMobileDialog = () => {
    showConfirmDialog('你还没有绑定手机号', '有读书房获取你的手机号，仅用于向你推送借阅请求相关的短信。不绑定手机号将不能使用有读书房的完整功能，是否绑定？',
        (confirm: boolean) => {
            if (confirm) {
                wx.navigateTo({
                    url: '../user/bind',
                })
            }
        })
}
