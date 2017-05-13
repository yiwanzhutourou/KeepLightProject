import { Book, parseBookInfo, parseBookList } from '../utils/bookUtils'
import { DoubanCallback, getBookInfo, searchBooks } from '../api/doubanapi'

// var Promise = require('../utils/es6-promise.min').Promise

const USER_INFO_KEY = 'user_info'
const ADDRESS_KEY = 'address'
const BOOK_KEY = 'book'

export type Address = {
    name: string,
    longitude: number,
    latitude: number,
}

export type Callback = (success: boolean, errMsg: string, result?: any) => void

export const setUserIntroApi = async (intro: string, cb: Callback) => {
    try {
        await wx.setStorageSync(USER_INFO_KEY, intro)
        cb(true, '', intro)
    } catch (e) {
        cb(false, '设置简介失败')
    }
}

export const getUserIntroApi = async (cb: Callback) => {
    try {
        let intro = await wx.getStorageSync(USER_INFO_KEY)
        cb(true, '', intro)
    } catch (e) {
        cb(false, '获取简介失败', '')
    }
}

export const addAddressApi = async (address: Address, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(ADDRESS_KEY) || []
    } catch (e) {
        cb(false, '无法获取地址')
        return
    }
    all.unshift(address)
    await wx.setStorageSync(ADDRESS_KEY, all)
    cb(true, '')
}

export const getAddressApi = async (cb: Callback) => {
    try {
        let all = await wx.getStorageSync(ADDRESS_KEY) || []
        cb(true, '', all)
    } catch (e) {
        cb(false, '无法获取地址')
    }
}

export const removeAddressApi = async (address: Address, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(ADDRESS_KEY) || []
    } catch (e) {
        cb(false, '无法获取地址')
        return
    }
    if (address && all && all.length > 0) {
        for (let i = all.length - 1; i >= 0; i--) {
            let addr = all[i] as Address
            if (addr && addr.name === address.name
                && addr.longitude === address.longitude
                && addr.latitude === address.latitude) {
                    all.splice(i, 1)
                    await wx.setStorageSync(ADDRESS_KEY, all)
                    cb(true, '删除成功')
                    return
            }
        }
    }
    cb(false, '地址不存在，无法删除')
}

export const addBookApi = async (book: Book, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(BOOK_KEY) || []
    } catch (e) {
        cb(false, '无法添加图书')
        return
    }
    book.added = true
    all.unshift(book)
    await wx.setStorageSync(BOOK_KEY, all)
    cb(true, '', book)
}

export const getBookApi = async (cb: Callback) => {
    try {
        let all = await wx.getStorageSync(BOOK_KEY) || []
        cb(true, '', all)
    } catch (e) {
        cb(false, '无法获取图书列表')
    }
}

export const removeBookByIdApi = async (bookId: string, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(BOOK_KEY) || []
    } catch (e) {
        cb(false, '无法获取图书列表')
        return
    }
    if (bookId && all && all.length > 0) {
        for (let i = all.length - 1; i >= 0; i--) {
            let book = all[i]
            if (book && book.id === bookId) {
                    all.splice(i, 1)
                    await wx.setStorageSync(ADDRESS_KEY, all)
                    cb(true, '删除成功', bookId)
                    return
            }
        }
    }
    cb(false, '图书不存在，无法删除')
}

export const searchBooksApi = (key: string, cb: DoubanCallback) => {
    searchBooks(key, (success: boolean, errMsg: string, statusCode: number, result: any) => {
        if (success && statusCode === 200 && result) {
            let all
            try {
                all = wx.getStorageSync(BOOK_KEY) || []
            } catch (e) {
                cb(false, errMsg, statusCode, null)
                return
            }

            let bookList = parseBookList(result)
            bookList.forEach((book: Book) => {
                filterBook(book, all)
            })
            result.books = bookList
        }
        cb(success, errMsg, statusCode, result)
    })
}

export const getBookInfoApi = (isbn: string, cb: DoubanCallback) => {
    getBookInfo(isbn, async (success: boolean, errMsg: string, statusCode: number, result: any) => {
        if (success && statusCode === 200 && result) {
            let all
            try {
                all = await wx.getStorageSync(BOOK_KEY) || []
            } catch (e) {
                cb(false, errMsg, statusCode, null)
                return
            }

            let bookList = parseBookInfo(result)
            bookList.forEach((book: Book) => {
                filterBook(book, all)
            })
            result.books = bookList
        }
        cb(success, errMsg, statusCode, result)

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
