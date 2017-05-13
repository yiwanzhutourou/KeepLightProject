export type Book = {
    title: string,
    author: Array<string>,
    url: string,
    cover: string,
}

export const parseBookInfo = (data: any) => {
    return {
        title: data.title,
        author: data.author,
        url: data.alt,
        cover: data.image,
    } as Book
}
