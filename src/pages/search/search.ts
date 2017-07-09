import { Book, DEFAULT_SEARCH_PAGE_SIZE, SearchResult } from '../../api/interfaces'
import { borrowBook, search } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

const INITIAL_PAGE = 0

let app = getApp()
let searchPage
let curPage = 0
let lastRequest = -1

Page({
  data: {
    searchResultList: [],
    keyword: '',
    screenHeight: 0,
    showLoadingMore: false,
    noMore: false,
  },

  onLoad: function(options: any): void {
    searchPage = this
    searchPage.setData({
      screenHeight: getScreenSizeInRpx().height,
    })
  },

  completeInput: (e) => {
    let keyword = e.detail.value
    if (!keyword || keyword === '') {
      return
    }
    curPage = 0
    searchPage.setData({
      keyword: keyword,
      showLoadingMore: false,
      noMore: false,
    })
    showLoading('正在定位并搜索')
    searchPage.requestLocation()
  },

  onBookItemTap: (e) => {
    let book: Book = e.currentTarget.dataset.book

    wx.navigateTo({
        url: '../book/book?title='
                  + book.title
                  + '&isbn=' + book.isbn
                  + '&showAddBook=' + true
                  + '&isAdded=' + book.added,
    })
  },

  requestLocation: () => {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        if (res) {
          let latitude = res.latitude
          let longitude = res.longitude
          let keyword = searchPage.data.keyword
          searchPage.searchResult(keyword, latitude, longitude)
        }
      },
      fail: () => {
        showErrDialog('无法获取您的定位')
      },
})
  },

  searchResult: (keyword: string, latitude: number, longitude: number) => {
    search(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPage,
        (result: Array<SearchResult>) => {
          hideLoading()
          searchPage.setData({
            noMore: result.length === 0,
          })
          if (!result || result.length === 0) {
            // TODO show empty view
          } else {
            searchPage.setData({
              searchResultList: searchPage.formatResult(result),
            })
          }
        },
        (failure) => {
          hideLoading()
        })
  },

  onReachBottom: (e) => {
    let keyword = searchPage.data.keyword
    if (!keyword) {
      return
    }
    if (lastRequest != -1 && e.timeStamp && e.timeStamp - lastRequest < 500) {
      return
    }
    lastRequest = e.timeStamp
    if (searchPage.data.noMore) {
      return
    }
    searchPage.showLoadingMore()

    curPage++
    searchPage.requestLocation()
  },

  showLoadingMore: () => {
    searchPage.setData({
      showLoadingMore: true,
    })
  },

  showNoMore: () => {
    searchPage.setData({
      showLoadingMore: true,
      noMore: true,
    })
  },

  hideLoadingMore: () => {
    searchPage.setData({
      showLoadingMore: false,
    })
  },

  formatResult: (result: Array<SearchResult>) => {
    return result
  },

  onShowUsers: (e) => {
    let index = Number(e.currentTarget.dataset.index)
    let list = searchPage.data.searchResultList
    if (index >= 0 && index < list.length) {
      list[index].showUsers = !list[index].showUsers
      searchPage.setData({
        searchResultList: list,
      })
    }
  },

  onBorrowBook: (e) => {
    let index = Number(e.detail.value.index)
    let list = searchPage.data.searchResultList
    if (index < 0 || index >= list.length) {
      return
    }
    let book: Book = list[index].book
    showConfirmDialog('借阅信息确认', '借阅书名：《' + book.title + '》\n将会向书房主人发送一条借阅请求，确认继续？', (confirm: boolean) => {
      if (confirm) {
        let formId = e.detail.formId
        let userId = e.detail.value.user
        if (formId && userId && book.isbn) {
          showLoading('正在发送借书请求')
          borrowBook(userId, book.isbn, formId,
            () => {
              hideLoading()
              showDialog('借书请求已发送，请等待书的主人回复~')
            }, (failure) => {
              hideLoading()
            })
        }
      }
    })
  },

  onUserItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },
})
