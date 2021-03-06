import { Book } from '../api/interfaces'

const BOOK_LIST_KEY = 'user_book_list_cache'

let borrowData: any
let bookDetailData: any

export const setBookDetailData = (title: string, content: string) => {
    bookDetailData = {
        title: title,
        content: content,
    }
}

export const getBookDetailData = () => {
    return bookDetailData
}

export const getBorrowData = () => {
    return borrowData
}

export const updateBorrowData = (data) => {
    borrowData = data
}

let bookList = new Array<string>()

export const replaceBookList = (list: Array<Book>) => {
    let newList = new Array<string>()

    if (list && list.length > 0) {
        list.forEach((book: Book) => {
            if (book) {
                newList.push(book.isbn)
            }
        })
    }
    setBookListCache(newList)
}

export const updateBookStatusByList = (list: Array<any>) => {
    if (!list || list.length === 0) {
        return
    }

    let oldList = getBookList()
    let newList = new Array<string>()
    oldList.forEach((isbn: string) => {
        let index = indexOfBook(isbn, list)
        if (index === -1) {
            newList.push(isbn)
        } else if (list[index].added) {
            newList.push(isbn)
        }
    })
    setBookListCache(newList)
}

const indexOfBook = (isbn: string, books: Array<any>) => {
    if (!books || books.length === 0) {
        return -1
    }
    for (let i = 0; i < books.length; i++) {
        if (books[i] && parseInt(books[i].id, 10) === parseInt(isbn, 10)) {
            return i
        }
    }
    return -1
}

export const updateBookStatus = (isbn: string, added: boolean) => {
    if (!isbn) {
        return
    }
    let oldList = getBookList()
    let index = oldList.indexOf(isbn)
    if (index === -1 && added) {
        oldList.push(isbn)
    }
    if (index >= 0 && !added) {
        oldList.splice(index, 1)
    }
    setBookListCache(oldList)
}

export const filterBookListByStatus = (list: Array<any>) => {
    let listInCache = getBookList()
    if (listInCache && listInCache.length > 0) {
        for (let i = 0; i < list.length; i++) {
            if (bookIsAdded(list[i], listInCache)) {
                list[i].added = true
            } else {
                list[i].added = false
            }
        }
    }
    return list
}

const bookIsAdded = (book: any, list: Array<string>) => {
    for (let i = 0; i < list.length; i++) {
        if (book && parseInt(list[i], 10) === parseInt(book.id, 10)) {
            return true
        }
    }
    return false
}

const getBookList = () => {
    if (!bookList || bookList.length === 0) {
        bookList = getBookListCacheSync()
    }
    if (!bookList) {
        bookList = new Array<string>()
    }
    return bookList
}

const setBookListCache = (list: Array<string>) => {
    bookList = list
    wx.setStorage({
        key: BOOK_LIST_KEY,
        data: list,
    })
}

const getBookListCacheSync = (): Array<string> => {
    return wx.getStorageSync(BOOK_LIST_KEY)
}
