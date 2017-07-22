
const URL_LIST_KEY = 'url_list'
const SHOW_LANDING_KEY = 'show_landing'

let urlList: Array<string>
let showLanding: number = -1

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

export const shouldShowLanding = () => {
    if (showLanding === -1) {
        showLanding = wx.getStorageSync(SHOW_LANDING_KEY)
        if (!showLanding && showLanding !== 0) {
            showLanding = -1
        }
    }
    return showLanding !== 1
}

export const setShowLanding = () => {
    wx.setStorage({
        key: SHOW_LANDING_KEY,
        data: 1,
    })
}
