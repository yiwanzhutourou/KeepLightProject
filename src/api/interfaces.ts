export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_SEARCH_PAGE_SIZE = 50

export type Book = {
    isbn: string,
    title?: string,
    author?: Array<string>,
    url?: string,
    cover?: string,
    publisher?: string,
    added?: boolean,
}

export const CODE_SUCCESS = 200

// Client error
export const CODE_BAD_REQUEST = 400
export const CODE_NOT_FOUND = 404

// Server error
export const CODE_SERVER_ERROR = 500

export type Result = {
    success: boolean,
    statusCode: number,
    errMsg: string,
    data?: any,
}

export type MapData = {
    latitude: number,
    longitude: number,
    zoomLevel: number,
}

export type Address = {
    id?: number,
    name: string,
    detail: string,
    longitude: number,
    latitude: number,
}

export type Markers = {
    id: number,
    latitude: number,
    longitude: number,
    iconPath: string,
    width: number,
    height: number,
    title?: string,
    bindcontroltap?: string,
    isMergeMarker: boolean,
    callout?: any,
    children?: Array<Markers>,
}

export type UserInfo = {
    nickname: string,
    avatar: string,
}

export type HomepageData = {
    info: string,
    nickname: string,
    avatar: string,
}

export type BorrowHistory = {
    requestId: number,
    userId: number,
    user: string,
    bookTitle: string,
    bookCover: string,
    date: string,
    status: number,
}

export type BorrowRequest = {
    requestId: number,
    fromUser: string,
    fromUserId: number,
    bookTitle: string,
    bookCover: string,
    date: string,
    status: number,
}

export type UserContact = {
    name: string,
    contact: string,
}

export type SearchResult = {
    book: Book,
    users: Array<SearchUser>,
}

export type SearchUser = {
    id: number,
    nickname: string,
    avatar: string,
    address: SearchAddress,
}

export type SearchAddress = {
    distance: number,
    distanceText: string,
    latitude: number,
    longitude: number,
    name: string,
    detail: string,
}
