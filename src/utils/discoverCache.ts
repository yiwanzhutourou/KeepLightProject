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
        if (discoverCache.list.length >= 30) { // 存太多怕炸，超过30条也就全清掉吧
            discoverCache.list = newCache.list
            discoverCache.topCursor = newCache.topCursor
            discoverCache.bottomCursor = newCache.bottomCursor
        } else {
            discoverCache.list = newCache.list.concat(discoverCache.list)
            discoverCache.topCursor = newCache.topCursor
            // 这种情况bottom cursor不变
        }
    } else {
        // 上拉刷新的数据暂时不做缓存
        discoverCache.bottomCursor = newCache.bottomCursor
    }

    // 保存到disk
    wx.setStorage({
        key: CACHE_DISCOVER_PAGE,
        data: discoverCache,
    })
}

export const deleteCardFromCache = (cardId) => {
    let list = getDiscoverList() as any
    console.log(cardId)
    console.log(cardId === 20)
    console.log(cardId === '20')
    let updated = false
    if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            if (item.type === 'card' && item.data) {
                console.log(item.data)
                console.log(item.data.id)
                console.log(parseInt(item.data.id, 10))
                if (parseInt(item.data.id, 10) === parseInt(cardId, 10)) {
                    console.log('here')
                    list.splice(i, 1)
                    updated = true
                    break
                }
            }
        }
    }
    if (updated) {
        discoverCache.list = list
        wx.setStorage({
            key: CACHE_DISCOVER_PAGE,
            data: discoverCache,
        })
    }
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
