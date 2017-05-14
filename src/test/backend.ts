import { Address, Book, CODE_BAD_REQUEST, CODE_SERVER_ERROR, CODE_SUCCESS, Callback, MapData, Result } from '../api/interfaces'
import { getBookInfo, searchBooks } from './doubanapi'
import { parseBookInfo, parseBookList } from '../utils/bookUtils'

// var Promise = require('../utils/es6-promise.min').Promise

const USER_KEY = 'app_user'
const USER_INFO_KEY = 'user_info'
const ADDRESS_KEY = 'address'
const BOOK_KEY = 'book'

export const checkUserApi = async (userToken: string, cb: Callback) => {
    if (!userToken || userToken === '') {
        callback(cb, false, CODE_BAD_REQUEST, '请求数据为空')
    }

    try {
        let tokens = await wx.getStorageSync(USER_KEY) || []
        tokens.forEach((token: string) => {
            if (token === userToken) {
                callbackSuccess(cb, true)
                return
            }
        });
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
    callbackSuccess(cb, false)
}

export const bindUserApi = async (userToken: string, cb: Callback) => {
    if (!userToken || userToken === '') {
        callback(cb, false, CODE_BAD_REQUEST, '请求数据为空')
    }

    try {
        let tokens = await wx.getStorageSync(USER_KEY) || []
        tokens.forEach((token: string) => {
            if (token === userToken) {
                callback(cb, false, CODE_BAD_REQUEST, '用户已经绑定')
                return
            }
        });
        tokens.unshift(userToken)
        await wx.setStorageSync(USER_KEY, tokens)
        callbackSuccess(cb, userToken)
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
}

export const setUserIntroApi = async (userToken: string, intro: string, cb: Callback) => {
    try {
        await wx.setStorageSync(USER_INFO_KEY + userToken, intro)
        callbackSuccess(cb, intro)
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
}

export const getUserIntroApi = async (userToken: string, cb: Callback) => {
    try {
        let intro = await wx.getStorageSync(USER_INFO_KEY + userToken)
        callbackSuccess(cb, intro)
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
}

export const addAddressApi = async (userToken: string, address: Address, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(ADDRESS_KEY + userToken) || []
        all.unshift(address)
        await wx.setStorageSync(ADDRESS_KEY + userToken, all)
        callbackSuccess(cb, address)
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
}

export const getAddressApi = async (userToken: string, cb: Callback) => {
    try {
        let all = await wx.getStorageSync(ADDRESS_KEY + userToken) || []
        callbackSuccess(cb, all)
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
}

export const removeAddressApi = async (userToken: string, address: Address, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(ADDRESS_KEY + userToken) || []
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
        return
    }
    if (address && all && all.length > 0) {
        for (let i = all.length - 1; i >= 0; i--) {
            let addr = all[i] as Address
            if (addr && addr.name === address.name
                && addr.longitude === address.longitude
                && addr.latitude === address.latitude) {
                    all.splice(i, 1)
                    await wx.setStorageSync(ADDRESS_KEY + userToken, all)
                    callbackSuccess(cb, address)
                    return
            }
        }
    }
    callback(cb, false, CODE_BAD_REQUEST, '地址不存在，无法删除')
}

export const addBookApi = async (userToken: string, book: Book, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(BOOK_KEY + userToken) || []
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
        return
    }
    book.added = true
    all.unshift(book)
    await wx.setStorageSync(BOOK_KEY + userToken, all)
    callbackSuccess(cb, book)
}

export const getBookApi = async (userToken: string, cb: Callback) => {
    try {
        let all = await wx.getStorageSync(BOOK_KEY + userToken) || []
        callbackSuccess(cb, all)
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
    }
}

export const removeBookByIdApi = async (userToken: string, bookId: string, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(BOOK_KEY + userToken) || []
    } catch (e) {
        callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
        return
    }
    if (bookId && all && all.length > 0) {
        for (let i = all.length - 1; i >= 0; i--) {
            let book = all[i]
            if (book && book.id === bookId) {
                    all.splice(i, 1)
                    await wx.setStorageSync(ADDRESS_KEY + userToken, all)
                    callbackSuccess(cb, bookId)
                    return
            }
        }
    }
    callback(cb, false, CODE_BAD_REQUEST, '图书不存在，无法删除')
}

export const searchBooksApi = (userToken: string, key: string, cb: Callback) => {
    searchBooks(key, (result: Result) => {
        if (result && result.success && result.statusCode === 200 && result.data) {
            let all
            try {
                all = wx.getStorageSync(BOOK_KEY + userToken) || []
            } catch (e) {
                callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
                return
            }

            let bookList = parseBookList(result.data)
            bookList.forEach((book: Book) => {
                filterBook(book, all)
            })
            result.data.books = bookList
        }
        callbackSuccess(cb, result.data)
    })
}

export const getBookInfoApi = (userToken: string, isbn: string, cb: Callback) => {
    getBookInfo(isbn, async (result: Result) => {
        if (result && result.success && result.statusCode === 200 && result.data) {
            let all
            try {
                all = await wx.getStorageSync(BOOK_KEY + cb) || []
            } catch (e) {
                callback(cb, false, CODE_SERVER_ERROR, '服务器发生未知错误，请稍后再试')
                return
            }

            let bookList = parseBookInfo(result.data)
            bookList.forEach((book: Book) => {
                filterBook(book, all)
            })
            result.data.books = bookList
        }
        callbackSuccess(cb, result.data)

    })
}

const filterBook = (book: Book, allAddedBooks: Array<Book>) => {
    if (book && allAddedBooks && allAddedBooks.length > 0) {
        for (let i = allAddedBooks.length - 1; i >= 0; i--) {
            if (allAddedBooks[i].id === book.id) {
                book.added = true
                return
            }
        }
    }
}

export const getMarkersOnMapApi = (data: MapData, cb: Callback) => {
    let markers: any = []
    for (let i = 0; i < 15; i++) {
        markers.push({
            id: i,
            latitude: data.latitude + getRandomNum(),
            longitude: data.longitude + getRandomNum(),
            title: '测试Title',
            iconPath: '/resources/img/icon_map_location.png',
            width: 60,
            height: 60,
        })
    }
    callbackSuccess(cb, markers)
}

const getRandomNum = () => {
    return Math.random() * 0.1
}

const callbackSuccess = (cb: Callback, data?: any) => {
    cb({
        success: true,
        statusCode: CODE_SUCCESS,
        errMsg: '',
        data: data,
    })
}

const callback = (
        cb: Callback, success: boolean, statusCode: number, errMsg: string, data?: any) => {
    cb({
        success: success,
        statusCode: statusCode,
        errMsg: errMsg,
        data: data,
    })
}
