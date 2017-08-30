import { MinePageData } from '../api/interfaces'

const URL_LIST_KEY = 'url_list'
const SHOW_LANDING_KEY = 'show_landing'
const SHOW_GUIDE_KEY = 'show_guide'
const MINE_PAGE_DATA_KEY = 'mine_page_data'

let urlList: Array<string>
let showLanding: number = -1
let showGuide: number = -1
let minePageCache: MinePageData
let homeSettingData: any = null

export const getHomeSettingData = () => {
    return homeSettingData
}

export const clearHomeSettingData = () => {
    homeSettingData = null
}

export const setHomeSettingData = (newData) => {
    homeSettingData = newData
}

export const getMinePageCache = () => {
    if (!minePageCache) {
        minePageCache = wx.getStorageSync(MINE_PAGE_DATA_KEY)
    }
    return minePageCache
}

export const updateMinePageCache = (newData: MinePageData) => {
    minePageCache = newData
    wx.setStorage({
        key: MINE_PAGE_DATA_KEY,
        data: minePageCache,
    })
}

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

export const clearShowLanding = () => {
    wx.removeStorageSync(SHOW_LANDING_KEY)
    showLanding = -1
}

export const shouldShowGuide = () => {
    if (showGuide === -1) {
        showGuide = wx.getStorageSync(SHOW_GUIDE_KEY)
        if (!showGuide && showGuide !== 0) {
            showGuide = -1
        }
    }
    return showGuide !== 1
}

export const setShowGuide = () => {
    wx.setStorage({
        key: SHOW_GUIDE_KEY,
        data: 1,
    })
}

export const clearShowGuide = () => {
    wx.removeStorageSync(SHOW_GUIDE_KEY)
    showGuide = -1
}
