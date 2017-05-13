export type DoubanCallback =
    (success: boolean, errMsg?: string, statusCode?: number, result?: any) => void

export const getBookInfo = (isbn: string, cb: DoubanCallback) => {
    // 从豆瓣获取图书信息
    wx.request({
        url: 'https://api.douban.com/v2/book/isbn/' + isbn,
        method: 'GET',
        success: (res: WeApp.HttpResponse) => {
            cb(true, res.errMsg, res.statusCode, res.data)
        },
        fail: (res: any) => {
            cb(false)
        },
    })
}
