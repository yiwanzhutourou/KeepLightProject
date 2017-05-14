import { Callback } from '../api/interfaces'

export const getBookInfo = (isbn: string, cb: Callback) => {
    // 从豆瓣获取图书信息
    wx.request({
        url: 'https://api.douban.com/v2/book/isbn/' + isbn,
        method: 'GET',
        success: (res: WeApp.HttpResponse) => {
            callback(cb, true, res.statusCode, res.errMsg, res.data)
        },
        fail: (res: any) => {
            callback(cb, false, res.statusCode, res.errMsg, res.data)
        },
    })
}

export const searchBooks = (key: string, cb: Callback) => {
    // 通过关键词从豆瓣搜索图书信息
    wx.request({
        url: 'https://api.douban.com/v2/book/search?q=' + key,
        method: 'GET',
        success: (res: WeApp.HttpResponse) => {
            callback(cb, true, res.statusCode, res.errMsg, res.data)
        },
        fail: (res: any) => {
            callback(cb, false, res.statusCode, res.errMsg, res.data)
        },
    })
}

const callback = (
        cb: Callback, success: boolean, statusCode: number, errMsg: string, data?: any) => {
    cb({
        success: success,
        statusCode: statusCode,
        errMsg: errMsg,
        data: data,
    })
}
