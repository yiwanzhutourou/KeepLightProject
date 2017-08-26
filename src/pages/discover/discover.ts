import { DiscoverItem, DiscoverPageData } from '../../api/interfaces'
import { getBottomCursor, getDiscoverList, getTopCursor, updateDiscoverCache } from '../../utils/discoverCache'
import { hideLoading, parseTimeToDate, showErrDialog, showLoading } from '../../utils/utils'

import { getDiscoverPageData } from '../../api/api'

const DISCOVER_REFRESH_INTERVAL = 5 * 60 * 1000

let discoverPage
let lastLoadDiscoverTime = -1

const formatList = (items: Array<DiscoverItem>) => {
   if (items && items.length > 0) {
     items.forEach((item: DiscoverItem) => {
        if (item.type === 'card' && item.data) {
            if (item.data.content) {
                item.data.content = item.data.content.replace(/\n/g, ' ')
            }
            item.data.timeString = parseTimeToDate(item.data.createTime)
        }
     })
   }
   return items
}

Page({
  data: {
      discoverList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
      showLoadingMore: true,
      noMore: false,
      showClickLoadMore: true,
      showPostBtn: false,
  },

  onLoad: function(options: any): void {
      discoverPage = this
  },

  onShow: function (): void {
      // 先读缓存里的数据
      discoverPage.loadDataFromCache()
      // 五分钟自动拉一次数据
      let now = new Date().getTime()
      if (lastLoadDiscoverTime === -1 || (now - lastLoadDiscoverTime) > DISCOVER_REFRESH_INTERVAL) {
          // 1.5.0开始支持的函数
          discoverPage.loadData()
      }
  },

  onPullDownRefresh: (e) => {
      lastLoadDiscoverTime = new Date().getTime()
      let topCursor = getTopCursor()
      getDiscoverPageData(topCursor, 1, (data: DiscoverPageData) => {
          wx.stopPullDownRefresh()
          // 更新缓存之后直接从缓存里读
          updateDiscoverCache(data, true)
          discoverPage.loadDataFromCache()
          discoverPage.hideLoadingMore(false)
          discoverPage.setData({
              showPostBtn: data.showPost,
          })
      }, (failure) => {
          wx.stopPullDownRefresh()
          if (!failure.data) {
              discoverPage.setData({
                  showNetworkError: true,
              })
          }
      })
  },

  onLoadMore: (e) => {
      discoverPage.showLoadingMore()
      let bottomCursor = getBottomCursor()
      getDiscoverPageData(bottomCursor, 0, (data: DiscoverPageData) => {
          // 上拉不更新缓存
          let newList = data ? formatList(data.list) : null
          if (newList) {
              let noMore = newList.length === 0
              let discoverList = discoverPage.data.discoverList.concat(newList)
              discoverPage.setData({
                  discoverList: discoverList,
                  showEmpty: discoverList.length == 0,
                  showList: discoverList.length > 0,
                  showClickLoadMore: !noMore,
                  noMore: noMore,
              })
          } else {
              discoverPage.hideLoadingMore(true)
          }
      }, (failure) => {
          discoverPage.hideLoadingMore(false)
          if (!failure.data) {
              showErrDialog('数据加载失败，请检查你的网络')
          }
      })
  },

  loadData: () => {
      lastLoadDiscoverTime = new Date().getTime()
      showLoading('正在加载')
      let topCursor = getTopCursor()
      getDiscoverPageData(topCursor, 1, (data: DiscoverPageData) => {
          hideLoading()
          // 更新缓存之后直接从缓存里读
          updateDiscoverCache(data, true)
          discoverPage.loadDataFromCache()
          discoverPage.hideLoadingMore(false)
          discoverPage.setData({
              showPostBtn: data.showPost,
          })
      }, (failure) => {
          discoverPage.hideLoadingMore()
          if (!failure.data) {
              discoverPage.setData({
                  showNetworkError: true,
              })
          }
      })
  },

  loadDataFromCache: () => {
    let cachedList = getDiscoverList()
    if (cachedList) {
        discoverPage.setData({
            discoverList: formatList(cachedList),
            showEmpty: cachedList.length == 0,
            showList: cachedList.length > 0,
        })
    }
  },

  onPost: (e) => {
      wx.navigateTo({
          url: '../card/post',
      })
  },

  onReload: (e) => {
      discoverPage.loadData()
  },

  onCardItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      wx.navigateTo({
          url: '../card/card?id=' + id,
      })
  },

  showLoadingMore: () => {
      discoverPage.setData({
          showClickLoadMore: false,
          noMore: false,
      })
  },

  hideLoadingMore: (noMore: boolean) => {
      discoverPage.setData({
          showClickLoadMore: !noMore,
          noMore: noMore,
      })
  },
})
