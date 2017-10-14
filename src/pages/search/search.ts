import { Book, DEFAULT_SEARCH_PAGE_SIZE, SearchResult, SearchUser } from '../../api/interfaces'
import { borrowBook, search, searchBooks, searchUsers } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { getDistrictShortString } from '../../utils/addrUtils'

const INITIAL_PAGE = 0

let app = getApp()
let searchPage
let curPageBooks = 0
let curPageUsers = 0
let lastRequestBooks = -1
let lastRequestUsers = -1
let keywords = ['', '']

const SEARCH_BOOK = 0
const SEARCH_USER = 1

const formatSearchResult = (results: Array<SearchResult>) => {
  if (results && results.length > 0) {
    results.forEach((result: SearchResult) => {
      result.users = formatUserList(result.users)
    })
  }
  return results
}

const formatUserList = (users: Array<SearchUser>) => {
  if (users && users.length > 0) {
    users.forEach((user: SearchUser) => {
        if (user.address) {
            user.addressText = user.address.city
                      ? getDistrictShortString(user.address.city) : user.address.detail
        } else {
            user.addressText = '暂无地址'
        }
    })
  }
  return users
}

Page({
  data: {
    currentTab: 0,
    searchResultList: [],
    searchUserResultList: [],
    keyword: '',
    screenHeight: 0,
    showLoadingMore: false,
    noMore: false,
    showLoadingMore2: false,
    noMore2: false,
    latitude: 0,
    longitude: 0,
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
    // 输入新的关键词，全部搜索数据重置
    curPageBooks = 0
    curPageUsers = 0
    searchPage.setData({
      keyword: keyword,
    })
    showLoading('正在搜索')
    searchPage.requestLocation()
  },

  onInputText: (e) => {
    searchPage.setData({
      keyword: e.detail.value,
    })
  },

  bindChange: (e) => {
      let index = Number(e.detail.current)
      searchPage.setData({
          currentTab: index,
      })
      searchPage.loadTabData(index)
  },

  swichNav: (e) => {
      if (searchPage.data.currentTab === e.target.dataset.current) {
          return false
      } else {
          let index = Number(e.target.dataset.current)
          searchPage.setData({
              currentTab: index,
          })
          searchPage.loadTabData(index)
      }
  },

  loadTabData: (index: number) => {
      let keyword = searchPage.data.keyword
      if (keywords[index] !== '' && keywords[index] === keyword) {
          return
      }
      if (!keyword || keyword === '') {
          return
      }
      showLoading('正在搜索')
      let latitude = searchPage.data.latitude
      let longitude = searchPage.data.longitude
      if (index === SEARCH_BOOK) {
          curPageBooks = 0
          searchPage.setData({
              searchResultList: [],
              showLoadingMore: false,
              noMore: false,
          })
          searchPage.searchBookResult(keyword, latitude, longitude)
      } else if (index === SEARCH_USER) {
          curPageUsers = 0
          searchPage.setData({
              searchUserResultList: [],
              showLoadingMore2: false,
              noMore2: false,
          })
          searchPage.searchUserResult(keyword, latitude, longitude)
      }
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  requestLocation: () => {
    if (searchPage.data.locationAquried) {
      let keyword = searchPage.data.keyword
      let latitude = searchPage.data.latitude
      let longitude = searchPage.data.longitude
      let index = searchPage.data.currentTab
      if (index === SEARCH_BOOK) {
          searchPage.searchBookResult(keyword, latitude, longitude)
      } else if (index === SEARCH_USER) {
          searchPage.searchUserResult(keyword, latitude, longitude)
      }
      return
    }
    app.getLocationInfo((locationInfo: WeApp.LocationInfo) => {
      // 无法定位就按在上海搜索
      let longitude = 121.438378
      let latitude = 31.181471
      if (locationInfo) {
        latitude = locationInfo.latitude
        longitude = locationInfo.longitude
      }
      searchPage.setData({
        latitude: latitude,
        longitude: longitude,
        locationAquried: true,
      })
      let keyword = searchPage.data.keyword
      let index = searchPage.data.currentTab
      if (index === SEARCH_BOOK) {
          searchPage.searchBookResult(keyword, latitude, longitude)
      } else if (index === SEARCH_USER) {
          searchPage.searchUserResult(keyword, latitude, longitude)
      }
    })
  },

  searchBookResult: (keyword: string, latitude: number, longitude: number) => {
    keywords[0] = keyword
    searchPage.setData({
      showLoadingMore: false,
      noMore: false,
    })
    search(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPageBooks,
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
              searchResultList: formatSearchResult(result),
            })
          }
        },
        (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('加载失败，请稍后再试')
          }
        })
  },

  searchUserResult: (keyword: string, latitude: number, longitude: number) => {
    keywords[1] = keyword
    searchPage.setData({
      showLoadingMore2: false,
      noMore2: false,
    })
    searchUsers(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPageUsers,
        (result: Array<SearchUser>) => {
          hideLoading()
          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.setData({
              showLoadingMore2: false,
              noMore2: true,
            })
          }
          if (!result || result.length === 0) {
            showDialog('没有对应的书房信息')
          } else {
            searchPage.setData({
              searchUserResultList: formatUserList(result),
            })
          }
        },
        (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('加载失败，请稍后再试')
          }
        })
  },

  onLoadMoreBooks: (e) => {
    let keyword = searchPage.data.keyword
    if (!keyword) {
      return
    }
    if (lastRequestBooks != -1 && e.timeStamp && e.timeStamp - lastRequestBooks < 500) {
      return
    }
    lastRequestBooks = e.timeStamp
    if (searchPage.data.noMore) {
      return
    }
    let latitude = searchPage.data.latitude
    let longitude = searchPage.data.longitude
    curPageBooks++
    searchPage.showLoadingMore()
    searchPage.loadMoreBooks(keyword, latitude, longitude)
  },

  onLoadMoreUsers: (e) => {
    let keyword = searchPage.data.keyword
    if (!keyword) {
      return
    }
    if (lastRequestUsers != -1 && e.timeStamp && e.timeStamp - lastRequestUsers < 500) {
      return
    }
    lastRequestUsers = e.timeStamp
    if (searchPage.data.noMore2) {
      return
    }
    let latitude = searchPage.data.latitude
    let longitude = searchPage.data.longitude
    curPageUsers++

    let index = searchPage.data.currentTab
    if (index === SEARCH_BOOK) {
        searchPage.showLoadingMore()
        searchPage.loadMoreBooks(keyword, latitude, longitude)
    } else if (index === SEARCH_USER) {
        searchPage.showLoadingMore2()
        searchPage.loadMoreUsers(keyword, latitude, longitude)
    }
  },

  loadMoreBooks: (keyword: string, latitude: number, longitude: number) => {
     // load more
    search(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPageBooks,
        (result: Array<SearchResult>) => {
          hideLoading()

          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.showNoMore()
          } else {
            searchPage.hideLoadingMore()
            let list = searchPage.data.searchResultList
            searchPage.setData({
              searchResultList: list.concat(formatSearchResult(result)),
            })
          }
        },
        (failure) => {
          searchPage.hideLoadingMore()
          if (!failure.data) {
            showErrDialog('加载失败')
          }
        })
  },

  loadMoreUsers: (keyword: string, latitude: number, longitude: number) => {
     // load more
    searchUsers(keyword, latitude, longitude, DEFAULT_SEARCH_PAGE_SIZE, curPageUsers,
        (result: Array<SearchUser>) => {
          hideLoading()

          let noMore = (result.length === 0)
          if (noMore) {
            searchPage.showNoMore2()
          } else {
            searchPage.hideLoadingMore2()
            let list = searchPage.data.searchUserResultList
            searchPage.setData({
              searchUserResultList: list.concat(formatUserList(result)),
            })
          }
        },
        (failure) => {
          searchPage.hideLoadingMore2()
          if (!failure.data) {
            showErrDialog('加载失败')
          }
        })
  },

  showLoadingMore: () => {
    searchPage.setData({
      showLoadingMore: true,
    })
  },

  showLoadingMore2: () => {
    searchPage.setData({
      showLoadingMore2: true,
    })
  },

  showNoMore: () => {
    searchPage.setData({
      showLoadingMore: true,
      noMore: true,
    })
  },

  showNoMore2: () => {
    searchPage.setData({
      showLoadingMore2: true,
      noMore2: true,
    })
  },

  hideLoadingMore: () => {
    searchPage.setData({
      showLoadingMore: false,
    })
  },

  hideLoadingMore2: () => {
    searchPage.setData({
      showLoadingMore2: false,
    })
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

  onUserItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onConfirmTap: (e) => {
    let keyword = searchPage.data.keyword
    if (!keyword || keyword === '') {
      return
    }
    curPageBooks = 0
    curPageUsers = 0
    showLoading('正在搜索')
    searchPage.requestLocation()
  },
})
