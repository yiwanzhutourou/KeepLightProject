import { Address, addBookApi, bindUserApi, checkUserApi, getBookApi, getMarkersOnMapApi, removeBookByIdApi } from '../test/backend'
import {
    addAddressApi,
    getAddressApi,
    getUserIntroApi,
    removeAddressApi,
    setUserIntroApi,
} from '../test/backend'

import { Book } from '../utils/bookUtils'
import { getUserToken } from '../utils/userUtils'
import { showErrDialog } from '../utils/utils'

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

// TODO: 统一入口为一个叫api的函数，传入请求的url, method, params等参数，统一做route
// TODO: 所有请求加一层beforeFilter，检查本地用token是否为空，如果为空提示用户绑定
// TODO: 所有请求加一层afterFilter，添加上所有请求都必须带的共同参数，例如userToken

export type Callback = (result: Result) => void

export type MapData = {
    latitude: number,
    longitude: number,
    zoomLevel: number,
}

export const callbackSuccess = (cb: Callback, data?: any) => {
    cb({
        success: true,
        statusCode: CODE_SUCCESS,
        errMsg: '',
        data: data,
    })
}

export const callback = (
        cb: Callback, success: boolean, statusCode: number, errMsg: string, data?: any) => {
    cb({
        success: success,
        statusCode: statusCode,
        errMsg: errMsg,
        data: data,
    })
}

export const bindUser = (cb: Callback) => {
    let userToken = getUserToken()
    bindUserApi(userToken, cb)
}

export const isUserBound = (cb: Callback) => {
    let userToken = getUserToken()
    checkUserApi(userToken, cb)
}

export const setUserIntro = (intro: string, cb: Callback) => {
    if (!intro) {
        showErrDialog('不能设置空的简介')
        return
    }

    if (intro.length > 70) {
        showErrDialog('简介不能超过 70 个字')
        return
    }

    let userToken = getUserToken()
    setUserIntroApi(userToken, intro, cb)
}

export const getUserIntro = (cb: Callback) => {
    let userToken = getUserToken()
    getUserIntroApi(userToken, cb)
}

export const addAddress = (address: Address, cb: Callback) => {
    let userToken = getUserToken()
    addAddressApi(userToken, address, cb)
}

export const removeAddress = (address: Address, cb: Callback) => {
    let userToken = getUserToken()
    removeAddressApi(userToken, address, cb)
}

export const getAddress = (cb: Callback) => {
    let userToken = getUserToken()
    getAddressApi(userToken, cb)
}

export const addBook = (book: Book, cb: Callback) => {
    let userToken = getUserToken()
    addBookApi(userToken, book, cb)
}

export const removeBook = (bookId: string, cb: Callback) => {
    let userToken = getUserToken()
    removeBookByIdApi(userToken, bookId, cb)
}

export const getBookList = (cb: Callback) => {
    let userToken = getUserToken()
    getBookApi(userToken, cb)
}

export const getMarkersOnMap = (data: MapData, cb: Callback) => {
    getMarkersOnMapApi(data, cb)
}
