import { Book } from '../api/interfaces'

let postModifyData: any

export const setPostModifyData = (
    id: number, title: string, content: string, picUrl: string, book: Book) => {
    postModifyData = {
        id: id,
        title: title,
        content: content,
        picUrl: picUrl,
        book: book,
        isModify: 1,
    }
}

export const setPostBookData = (book: Book) => {
    postModifyData = {
        book: book,
    }
}

export const clearPostModifyData = () => {
    postModifyData = null
}

export const getPostModifyData = () => {
    return postModifyData
}
