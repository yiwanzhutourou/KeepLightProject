export type Book = {
    id: string,
    title: string,
    author: Array<string>,
    url: string,
    cover: string,
    publisher: string,
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

export type Callback = (result: Result) => void

export type MapData = {
    latitude: number,
    longitude: number,
    zoomLevel: number,
}

export type Address = {
    name: string,
    longitude: number,
    latitude: number,
}
