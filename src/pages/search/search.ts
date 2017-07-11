import { Book, DEFAULT_SEARCH_PAGE_SIZE, SearchResult, SearchUser } from '../../api/interfaces'
import { borrowBook, search, searchUsers } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

const INITIAL_PAGE = 0

let app = getApp()
let searchPage
let curPage = 0
let lastRequest = -1

const SEARCH_BOOK = 0
const SEARCH_USER = 1

Page({
  data: {
    searchResultList: [],
    searchUserResultList: [],
    searchRange: [
          '图书', '书房',
    ],
    searchIndex: SEARCH_BOOK,
    keyword: '',
    screenHeight: 0,
    showLoadingMore: false,
    noMore: false,
    latitude: 0,
    longitude: 0,
    showBorrowButton: true,
    locationAquried: false,
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

  bindPickerChange: (e) => {
      let index = Number(e.detail.value)
      searchPage.setData({
          searchIndex: index,
      })
      curPage = 0
      searchPage.setData({
          searchResultList: [],
          searchUserResultList: [],
          showLoadingMore: false,
          noMore: false,
      })
      let keyword = searchPage.data.keyword
      if (!keyword || keyword === '') {
          return
      }
      showLoading('正在搜索')
      let latitude = searchPage.data.latitude
      let longitude = searchPage.data.longitude
      if (index === SEARCH_BOOK) {
          searchPage.searchBookResult(keyword, latitude, longitude)
      } else if (index === SEARCH_USER) {
          searchPage.searchUserResult(keyword, latitude, longitude)
      }
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
    if (searchPage.data.locationAquried) {
      let keyword = searchPage.data.keyword
      let latitude = searchPage.data.latitude
      let longitude = searchPage.data.longitude
      let index = searchPage.data.searchIndex
      if (index === SEARCH_BOOK) {
          searchPage.searchBookResult(keyword, latitude, longitude)
      } else if (index === SEARCH_USER) {
          searchPage.searchUserResult(keyword, latitude, longitude)
      }
      return
    }
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        if (res) {
          let latitude = res.latitude
          let longitude = res.longitude
          searchPage.setData({
            latitude: latitude,
            longitude: longitude,
            locationAquried: true,
          })
          let keyword = searchPage.data.keyword
          let index = searchPage.data.searchIndex
          if (index === SEARCH_BOOK) {
              searchPage.searchBookResult(keyword, latitude, longitude)
          } else if (index === SEARCH_USER) {
              searchPage.searchUserResult(keyword, latitude, longitude)
          }
        }
      },
      fail: () => {
        showErrDialog('无法获取您的定位')
      },
    })
  },

  searchBookResult: (keyword: string, latitude: number, longitude: number) => {
    search(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPage,
        (result: Array<SearchResult>) => {
          hideLoading()
          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.setData({
              showLoadingMore: false,
              noMore: true,
            })
          }
          if (!result || result.length === 0) {
            showDialog('没有对应的图书信息')
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

  searchUserResult: (keyword: string, latitude: number, longitude: number) => {
    searchUsers(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPage,
        (result: Array<SearchUser>) => {
          hideLoading()
          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.setData({
              showLoadingMore: false,
              noMore: true,
            })
          }
          if (!result || result.length === 0) {
            showDialog('没有对应的书房信息')
          } else {
            searchPage.setData({
              searchUserResultList: result,
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
    let latitude = searchPage.data.latitude
    let longitude = searchPage.data.longitude
    searchPage.showLoadingMore()
    curPage++

    let index = searchPage.data.searchIndex
    if (index === SEARCH_BOOK) {
        searchPage.loadMoreBooks(keyword, latitude, longitude)
    } else if (index === SEARCH_USER) {
        searchPage.loadMoreUsers(keyword, latitude, longitude)
    }
  },

  loadMoreBooks: (keyword: string, latitude: number, longitude: number) => {
     // load more
    search(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPage,
        (result: Array<SearchResult>) => {
          hideLoading()

          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.showNoMore()
          } else {
            searchPage.hideLoadingMore()
            let list = searchPage.data.searchResultList
            searchPage.setData({
              searchResultList: list.concat(searchPage.formatResult(result)),
            })
          }
        },
        (failure) => {
          hideLoading()
          showErrDialog('加载失败')
        })
  },

  loadMoreUsers: (keyword: string, latitude: number, longitude: number) => {
     // load more
    searchUsers(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPage,
        (result: Array<SearchUser>) => {
          hideLoading()

          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.showNoMore()
          } else {
            searchPage.hideLoadingMore()
            let list = searchPage.data.searchUserResultList
            searchPage.setData({
              searchUserResultList: list.concat(result),
            })
          }
        },
        (failure) => {
          hideLoading()
          showErrDialog('加载失败')
        })
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

  onCancelTap: (e) => {
    wx.navigateBack({
        delta: 1,
    })
  },
})
