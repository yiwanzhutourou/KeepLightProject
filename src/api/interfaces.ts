export const VERSION_CODE = '1.1.1'

export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_SEARCH_PAGE_SIZE = 50

export type LoginData = {
    token: string,
    hasMobile: boolean,
}

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
    city?: CityInfo,
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
    children?: string,
}

export type UserInfo = {
    nickname: string,
    avatar: string,
}

export type HomepageData = {
    userId: number,
    info: string,
    nickname: string,
    avatar: string,
    address: Array<Address>,
    books: Array<Book>,
    cards: Array<MyCardItem>,
    cardCount: number,
    isMe: boolean,
    followed: boolean,
    followerCount: number,
    followingCount: number,
}

export type GuideData = {
    info: string,
    address: Array<Address>,
    contact: UserContact,
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
    bookCount: number,
    addressText?: string,
}

export type CityInfo = {
    province: string,
    city: string,
    district: string,
}

export type SearchAddress = {
    distance: number,
    distanceText: string,
    latitude: number,
    longitude: number,
    name: string,
    detail: string,
    city?: CityInfo,
}

export type SettingsData = {
    contact: UserContact,
    mobileTail: string,
    address: Array<CityInfo>,
}

export type MinePageData = {
    nickname: string,
    avatar: string,
    bookCount: number,
    cardCount: number,
    followerCount: number,
    followingCount: number,
}

export type User = {
    id: number,
    nickname: string,
    avatar: string,
}

export type ChatListData = {
    messages: Array<ChatListItem>,
    timestamp: number,
}

export type ChatListItem = {
    user: User,
    message: string,
    timeStamp: number,
    unreadCount: number,
    timeString?: string,
    localTimestamp?: number,
}

export type ChatData = {
    self: User,
    other: User,
    messages: Array<Message>,
    timestamp: number,
}

export type Message = {
    type: string,
    from: number,
    to: number,
    timeStamp: number,
    content?: string,
    extra?: any,
    timeString?: string,
    showLoading?: boolean,
    showError?: boolean,
    isFake?: boolean,
}

export type ExtraBorrowRequest = {
    isbn: string,
    title: string,
    cover: string,
    status: number,
    requestId: number,
}

export type CardDetail = {
    id: number,
    user: User,
    title: string,
    content: string,
    picUrl: string,
    book: Book,
    createTime: number,
    isMe: boolean,
    timeString?: string,
}

export type MyCardItem = {
    id: number,
    title: string,
    content: string,
    picUrl: string,
    bookTitle: string,
    createTime: number,
    timeString?: string,
}

export type DiscoverItem = {
    type: string,
    data: any,
}

export type DiscoverPageData = {
    list: Array<DiscoverItem>,
    topCursor: number,
    bottomCursor: number,
    showPost: boolean,
}
