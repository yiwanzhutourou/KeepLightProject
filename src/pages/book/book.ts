import { addNewBook, getBookDetails, removeBook, getBookPageData } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'
import { setBookDetailData, updateBookStatus } from '../../utils/bookCache'

import { parseAuthor } from '../../utils/bookUtils'
import { SearchUser, BookPageData } from '../../api/interfaces'
import { getDistrictShortString } from '../../utils/addrUtils'

let app = getApp()
let bookPage

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
      isbn: '',
      screenHeight: 0,
      bookDetail: null,
      doubanBook: '',
      userList: [],
      showUsers: false,
      showAddBook: false,
      extraLoaded: false,
  },

  onLoad: function(option: any): void {
    bookPage = this

    if (!option || !option.isbn) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }

    bookPage.setData({
        screenHeight: getScreenSizeInRpx().height,
        isbn: option.isbn,
    })

    showLoading('正在加载...')
    getBookDetails(option.isbn, (result: any) => {
        hideLoading()
        if (result) {
            bookPage.setData({
                doubanBook: result,
                bookDetail: {
                    bigImage: result.images ? result.images.large : '',
                    smallImage: result.image,
                    title: result.title,
                    author: parseAuthor(result.author, ' '),
                    publisher: result.publisher ? '出版社：' + result.publisher : '',
                    translator: result.translator ? '译者：' + result.translator : '',
                    pubdate: result.pubdate ? '出版时间：' + result.pubdate : '',
                    pages: result.pages ? '页数：' + result.pages : '',
                    binding: result.binding ? '装帧：' + result.binding : '',
                    series: result.series && result.series.title ? '丛书：' + result.series.title : '',
                    isbn: result.isbn13 ? 'ISBN：' + result.isbn13 : '',
                    summary: result.summary,
                    author_intro: result.author_intro,
                    catalog: result.catalog,
                },
            })
            if (result.title) {
                wx.setNavigationBarTitle({
                    title: result.title,
                })
            }
            bookPage.loadBookCards()
        } else {
            showErrDialog('无法加载图书详情，请稍后再试')
        }
    }, () => {
        hideLoading()
        showErrDialog('无法加载图书详情，请检查你的网络状态')
    })
  },

  onShowContent: (e) => {
      let bookTitle = bookPage.data.bookDetail.title
      let title = e.currentTarget.dataset.title
      let content = e.currentTarget.dataset.content
      if (content) {
          setBookDetailData(bookTitle + ' - ' + title, content)
          wx.navigateTo({
              url: '../book/bookDetail',
          })
      }
  },

  loadBookCards: () => {
    let isbn = bookPage.data.isbn
    if (isbn) {
        app.getLocationInfo((locationInfo: WeApp.LocationInfo) => {
            // 无法定位就按在上海搜索
            let longitude = 121.438378
            let latitude = 31.181471
            if (locationInfo) {
                latitude = locationInfo.latitude
                longitude = locationInfo.longitude
            }
            getBookPageData(isbn, latitude, longitude,
              (data: BookPageData) => {
                  if (data) {
                      bookPage.setData({
                          userList: formatUserList(data.users),
                          showUsers: data.users && data.users.length > 0,
                          showAddBook: data.hasBook === 0,
                          extraLoaded: true,
                      })
                  }
              }, (failure) => {
                  if (!failure.data) {
                      showErrDialog('无法加载图书卡片，请检查你的网络')
                  }
              })
        })
    }
},


  onUserItemTap: (e) => {
    let user = e.currentTarget.dataset.user
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + user,
    })
  },

  onShareAppMessage: () => {
      let bookDetail = bookPage.data.bookDetail
      let isbn = bookPage.data.isbn
      return {
          title: bookDetail.title,
          path: 'pages/book/book?isbn=' + isbn,
      }
  },

  onAddBook: () => {
    let doubanBook = bookPage.data.doubanBook
    if (!doubanBook) {
        return
    }
    showLoading('正在添加')
    addNewBook(doubanBook, () => {
      hideLoading()
      showDialog('已添加')
      bookPage.setData({
        showAddBook: false,
      })
      updateBookStatus(doubanBook.id, true)
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法添加图书，请检查你的网络')
      }
    })
  },

  onRemoveBook: () => {
    let isbn = bookPage.data.isbn
    if (!isbn) {
        return
    }
    let title = bookPage.data.bookDetail && bookPage.data.bookDetail.title ?
                    '《' + bookPage.data.bookDetail.title + '》' : '这本书'
    showConfirmDialog('', '确认从你的书房移除' + title + '？', (confirm: boolean) => {
      if (confirm) {
        showLoading('正在删除')
        removeBook(isbn, () => {
          hideLoading()
          showDialog('已移除')
          bookPage.setData({
            showAddBook: true,
          })
          updateBookStatus(isbn, false)
        }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法删除图书，请检查你的网络')
          }
        })
      }
    })
  },
})
