import { DiscoverItem, DiscoverPageData } from '../api/interfaces'

const CACHE_DISCOVER_PAGE = 'discover_page'

let discoverCache: DiscoverPageData

export const updateDiscoverCache = (newCache: DiscoverPageData, isTop: boolean) => {
    if (!newCache || !newCache.list || newCache.list.length === 0) {
        return
    }
    if (!discoverCache) {
        discoverCache = newCache
    } else if (isTop) {
        // 下拉刷新先全量替换吧，没想到什么好办法更新删除/修改之后的缓存
        discoverCache.banner = newCache.banner
        discoverCache.list = newCache.list
        discoverCache.topCursor = newCache.topCursor
        discoverCache.bottomCursor = newCache.bottomCursor
        discoverCache.bookBottomCursor = newCache.bookBottomCursor
    }

    // 保存到disk
    wx.setStorage({
        key: CACHE_DISCOVER_PAGE,
        data: discoverCache,
    })
}

export const getBanner = () => {
    if (!discoverCache) {
        discoverCache = wx.getStorageSync(CACHE_DISCOVER_PAGE)
    }
    if (discoverCache) {
        return discoverCache.banner
    }
    return null
}

export const getDiscoverList = () => {
    if (!discoverCache) {
        discoverCache = wx.getStorageSync(CACHE_DISCOVER_PAGE)
    }
    if (discoverCache) {
        return discoverCache.list
    }
    return null
}

export const getTopCursor = () => {
    if (!discoverCache) {
        discoverCache = wx.getStorageSync(CACHE_DISCOVER_PAGE)
    }
    if (discoverCache) {
        return discoverCache.topCursor
    }
    return -1
}

export const getBottomCursor = () => {
    if (!discoverCache) {
        discoverCache = wx.getStorageSync(CACHE_DISCOVER_PAGE)
    }
    if (discoverCache) {
        return discoverCache.bottomCursor
    }
    return -1
}

export const getBookBottomCursor = () => {
    if (!discoverCache) {
        discoverCache = wx.getStorageSync(CACHE_DISCOVER_PAGE)
    }
    if (discoverCache) {
        return discoverCache.bookBottomCursor
    }
    return -1
}
