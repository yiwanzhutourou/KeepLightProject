
const URL_LIST_KEY = 'url_list'

let urlList: Array<string>

export const getUrlList = () => {
    if (!urlList) {
        urlList = wx.getStorageSync(URL_LIST_KEY)
    }
    return urlList
}

export const addUrlToList = (url: any) => {
    if (!urlList) {
        urlList = new Array<string>()
    }
    urlList.push(url)
    wx.setStorage({
        key: URL_LIST_KEY,
        data: urlList,
    })
} 
