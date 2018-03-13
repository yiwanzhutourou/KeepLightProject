import { DiscoverItem, DiscoverPageData } from '../../api/interfaces'
import { getBanner, getBookBottomCursor, getBottomCursor, getDiscoverList, getShowPostBtn, updateDiscoverCache } from '../../utils/discoverCache'
import { hideLoading, parseTimeToDate, showErrDialog, showLoading } from '../../utils/utils'

import { clearPostModifyData } from '../../utils/postCache'
import { getDiscoverPageData } from '../../api/api'
import { parseAuthor } from '../../utils/bookUtils'
import { shouldShowLanding } from '../../utils/urlCache';

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
        } else if (item.type === 'book' && item.data) {
            item.data.timeString = parseTimeToDate(item.data.createTime)
        }
     })
   }
   return items
}

Page({
  data: {
      banners: [],
      discoverList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
      showLoadingMore: true,
      noMore: false,
      showClickLoadMore: true,
      showPostBtn: false,
      bottomCursor: -1,
      bookBottomCursor: -1,
  },

  onLoad: function(options: any): void {
      discoverPage = this
      // 先读缓存里的数据
      discoverPage.loadDataFromCache()
  },

  onShow: function (): void {
    let showLanding = shouldShowLanding()
    if (showLanding) {
        setTimeout(() => {
            wx.navigateTo({
                url: '../index/landing',
            })
        }, 1500)
    }

    discoverPage.setData({
        showPostBtn: getShowPostBtn(),
    })
    // 五分钟自动拉一次数据
    let now = new Date().getTime()
    if (lastLoadDiscoverTime === -1 || (now - lastLoadDiscoverTime) > DISCOVER_REFRESH_INTERVAL) {
        discoverPage.loadData()
    }
  },

  onPullDownRefresh: (e) => {
      lastLoadDiscoverTime = new Date().getTime()
      getDiscoverPageData(0, 0, 1, (data: DiscoverPageData) => {
          wx.stopPullDownRefresh()
          // 更新缓存之后直接从缓存里读
          data.list = formatList(data.list)
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
      let bottomCursor = discoverPage.data.bottomCursor
      let bookBottomCursor = discoverPage.data.bookBottomCursor
      getDiscoverPageData(bottomCursor, bookBottomCursor, 0, (data: DiscoverPageData) => {
          // 上拉不更新缓存
          let newList = data ? formatList(data.list) : null
          if (newList) {
              let noMore = newList.length === 0
              let discoverList = discoverPage.data.discoverList.concat(newList)
              discoverPage.setData({
                  discoverList: discoverList,
                  bottomCursor: data.bottomCursor,
                  bookBottomCursor: data.bookBottomCursor,
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
      getDiscoverPageData(0, 0, 1, (data: DiscoverPageData) => {
          hideLoading()
          // 更新缓存之后直接从缓存里读
          data.list = formatList(data.list)
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
    let banners = getBanner()
    let cachedList = getDiscoverList()
    let bottomCursor = getBottomCursor()
    let bookBottomCursor = getBookBottomCursor()
    if (cachedList) {
        discoverPage.setData({
            banners: banners,
            discoverList: cachedList,
            bottomCursor: bottomCursor,
            bookBottomCursor: bookBottomCursor,
            showEmpty: cachedList.length == 0,
            showList: cachedList.length > 0,
        })
    }
  },

  onPost: (e) => {
      clearPostModifyData()
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
          url: '../card/card?id=' + id + '&fromList=1',
      })
  },

  onArticleItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      wx.navigateTo({
          url: '../card/richcard?id=' + id,
      })
  },

  onBookItemTap: (e) => {
      let isbn = e.currentTarget.dataset.isbn
      wx.navigateTo({
          url: '../book/book?isbn=' + isbn,
      })
  },

  onBannerTap: (e) => {
      let type = e.currentTarget.dataset.type
      let id = e.currentTarget.dataset.id
      if (type === 'book') {
          wx.navigateTo({
              url: '../book/book?isbn=' + id,
          })
      } else if (type === 'card') {
          let fullPic = e.currentTarget.dataset.bigpic
          if (fullPic) {
              wx.previewImage({
                  current: fullPic,
                  urls: [fullPic],
              })
          } else {
              wx.navigateTo({
                  url: '../card/card?id=' + id + '&fromList=1',
              })
          }
      } else if (type === 'article') {
        wx.navigateTo({
            url: '../card/richcard?id=' + id,
        })
      }
  },

  onUserTap: (e) => {
      let user = e.currentTarget.dataset.user
      wx.navigateTo({
          url: '../homepage/homepage2?user=' + user,
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

  onShareAppMessage: () => {
    return {
      title: '有读书房',
      path: 'pages/discover/discover',
    }
  },
})
