import { Book, HomepageData } from '../../api/interfaces'
import { addAddress, borrowBook, follow, getBookList, getHomepageData, removeBook, unfollow } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'
import { replaceBookList, updateBookStatus } from '../../utils/bookCache'

import { getAddressDisplayText } from '../../utils/addrUtils'

let homepage2

Page({
  data: {
    userId: '',
    isHomePage: true, // always true
    isCurrentUser: false,
    isMyPage: false, // always false

    homepageData: {},
    addressText: '',
    followed: false,
    followerNumber: 0,
    followingNumber: 0,
    bookList: [],
    showContent: false,
    showNetworkError: false,
  },

  onLoad: function(option: any): void {
    homepage2 = this

    showLoading('正在加载...')
    if (option && option.user) {
      homepage2.setData({
        userId: option.user,
      })
    }
  },

  onShow: function (): void {
      homepage2.loadData()
  },

  onReload: (e) => {
    showLoading('正在加载...')
    homepage2.loadData()
  },

  loadData: () => {
    let id = homepage2.data.userId
    getHomepageData(id, (result: HomepageData) => {
      hideLoading()
      let books = result.books
      homepage2.setData({
        homepageData: {
          nickName: result.nickname + '的书房',
          avatarUrl: result.avatar ? result.avatar : '/resources/img/default_avatar.png',
          userIntro: result.info,
        },
        bookList: books,
        addressText: getAddressDisplayText(result.address),
        showContent: true,
        showNetworkError: false,
        isCurrentUser: result.isMe,
        followed: result.followed,
        followerNumber: result.followerCount,
        followingNumber: result.followingCount,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        if (!homepage2.data.homepageData.nickName) {
          homepage2.setData({
            showNetworkError: true,
            showContent: false,
          })
        }
      }
    })
  },

  onBorrowBook: (e) => {
    showConfirmDialog('借阅信息确认', '借阅书名：《' + e.currentTarget.dataset.title + '》\n将会向书房主人发送一条借阅请求，确认继续？', (confirm: boolean) => {
      if (confirm) {
        let formId = e.detail.formId
        let isbn = e.currentTarget.dataset.isbn
        if (formId && isbn) {
          showLoading('正在发送借书请求')
          borrowBook(homepage2.data.userId, isbn, formId,
            () => {
              hideLoading()
              showDialog('借书请求已发送，请等待书的主人回复~')
            }, (failure) => {
              hideLoading()
              if (!failure.data) {
                if (!failure.data) {
                  showErrDialog('无法借阅，请检查你的网络')
                }
              }
            })
        }
      }
    })
  },

  onBookItemTap: (e) => {
    let book: Book = e.currentTarget.dataset.book
    let userId = homepage2.data.userId
    wx.navigateTo({
        url: '../book/book?isbn=' + book.isbn
                + '&showBorrowBook=' + !homepage2.data.isCurrentUser
                + '&belongTo=' + userId,
    })
  },

  onUploadBook: (e) => {
    wx.switchTab({
      url: '../book/addBook',
    })
  },

  onShareAppMessage: () => {
    if (homepage2.data.homepageData) {
      return {
        title: homepage2.data.homepageData.nickName,
        path: 'pages/homepage/homepage2?user=' + homepage2.data.userId,
      }
    } else {
      return {
        title: '有读书房',
        path: 'pages/index/index',
      }
    }
  },

  onFollowTap: (e) => {
    let userId = homepage2.data.userId
    if (userId) {
      showLoading('正在关注')
      follow(userId, (result: string) => {
        hideLoading()
        showDialog('已关注')
        homepage2.setData({
          followed: true,
          followerNumber: homepage2.data.followerNumber + 1,
        })
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
            if (!failure.data) {
                showErrDialog('无法关注，请检查你的网络')
            }
        }
      })
    }
  },

  onUnfollowTap: (e) => {
    let userId = homepage2.data.userId
    if (userId) {
      showLoading('正在取消')
      unfollow(userId, (result: string) => {
        hideLoading()
        showDialog('已取消')
        homepage2.setData({
          followed: false,
          followerNumber: homepage2.data.followerNumber - 1,
        })
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
            if (!failure.data) {
                showErrDialog('取消关注失败，请检查你的网络')
            }
        }
      })
    }
  },
})
