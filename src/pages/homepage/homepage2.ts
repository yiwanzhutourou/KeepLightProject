import { Book, HomepageData } from '../../api/interfaces'
import { addAddress, borrowBook, getBookList, getHomepageData, removeBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showLoading, showToast } from '../../utils/utils'
import { replaceBookList, updateBookStatus } from '../../utils/bookCache'

let homepage2

Page({
  data: {
    userId: '',
    isHomePage: true, // always true
    isCurrentUser: false,
    isMyPage: false, // always false

    homepageData: {},
    bookList: [],
    showEmpty: false,
  },

  onLoad: function(option: any): void {
    homepage2 = this

    if (option && option.user) {
      homepage2.setData({
        userId: option.user,
      })
    }
  },

  onShow: function (): void {
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
        showEmpty: books.length == 0,
        isCurrentUser: result.isMe,
      })
    }, (failure) => {
      hideLoading()
    })
  },

  onBorrowBook: (e) => {
    showConfirmDialog('借阅信息确认', '借阅书名：《' + e.detail.value.title + '》\n将会向书房主人发送一条借阅请求，确认继续？', (confirm: boolean) => {
      if (confirm) {
        let formId = e.detail.formId
        let isbn = e.detail.value.isbn
        if (formId && isbn) {
          showLoading('正在发送借书请求')
          borrowBook(homepage2.data.userId, isbn, formId,
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

  onBookItemTap: (e) => {
    let book: Book = e.currentTarget.dataset.book
    let userId = homepage2.data.userId
    wx.navigateTo({
        url: '../book/book?title=' + book.title
                + '&isbn=' + book.isbn
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
})
