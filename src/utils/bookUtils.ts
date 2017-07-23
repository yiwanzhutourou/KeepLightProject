import { Book } from '../api/interfaces'

export const parseBookInfo = (data: any) => {
    let bookList: Array<Book> = []
    if (data) {
        bookList.push({
            isbn: data.isbn13,
            title: data.title,
            author: data.author,
            url: data.alt,
            cover: data.image,
            publisher: data.publisher,
        })
    }
    return bookList
}

export const parseBookList = (data: any) => {
    let bookList: Array<Book> = []
    if (data && data.books) {
        data.books.forEach((book: any) => {
            bookList.push({
                isbn: book.isbn13,
                title: book.title,
                author: book.author,
                url: book.alt,
                cover: book.image,
                publisher: book.publisher,
            })
        })
    }
    return bookList
}

export const parseAuthor = (authors: Array<string>, s: string) => {
    let result = ''
    if (authors && authors.length > 0) {
        authors.forEach((author) => {
            result += author + s
        })
    }
    if (result.length > 0) {
        result = result.substring(0, result.length - 1)
    }
    return result
}
