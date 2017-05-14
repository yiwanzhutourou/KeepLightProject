import { Book } from '../api/interfaces'

export const parseBookInfo = (data: any) => {
    let bookList: Array<Book> = []
    if (data) {
        bookList.push({
            id: data.id,
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
                id: book.id,
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
