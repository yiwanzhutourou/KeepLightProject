import { Book, HomepageData } from '../../api/interfaces'
// pages/homepage/homepage.js
import { addAddress, borrowBook, getBookList, getHomepageData, removeBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showLoading, showToast } from '../../utils/utils'

let homepage: WeApp.Page

Page({
  data: {
    userId: '',
    homepageData: {},
    bookList: [],
    isHomePage: true,
    isCurrentUser: true,
    showEmpty: false,
  },
  onLoad: function(option: any): void {
    homepage = this

    if (option && option.user) {
      homepage.setData({
        userId: option.user,
        isCurrentUser: false,
      })
    }
  },

  onShow: function (): void {
      homepage.loadData()
  },

  onPullDownRefresh: () => {
    wx.stopPullDownRefresh()
    showLoading('正在加载...')
    homepage.loadData()
  },

  loadData: () => {
    let id = homepage.data.userId
    getHomepageData(id, (result: HomepageData) => {
      homepage.setData({
        homepageData: {
          nickName: result.nickname + '的书房',
          avatarUrl: result.avatar ? result.avatar : '/resources/img/default_avatar.png',
          userIntro: result.info,
        },
      })
    }, (failure) => {
      // do nothing
    })

    getBookList(id, (books: Array<Book>) => {
      hideLoading()
      homepage.setData({
        bookList: books,
        showEmpty: books.length == 0,
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
          borrowBook(homepage.data.userId, isbn, formId,
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
    let userId = homepage.data.userId
    wx.navigateTo({
        url: '../book/book?title=' + book.title
                + '&isbn=' + book.isbn
                + '&showBorrowBook=' + !homepage.data.isCurrentUser
                + '&belongTo=' + userId,
    })
  },

  onUploadBook: (e) => {
    wx.switchTab({
      url: '../book/addBook',
    })
  },

  onRemoveBook: (e) => {
    showConfirmDialog('', '确认从您的书房中移除《' + e.currentTarget.dataset.title + '》？', (confirm: boolean) => {
      if (confirm) {
        showLoading('正在删除')
        removeBook(e.currentTarget.dataset.isbn, (isbn: string) => {
          hideLoading()
          if (homepage.data.bookList) {
            let bookList: Array<Book> = []
            homepage.data.bookList.forEach((book: Book) => {
              let added = book.added
              if (isbn !== book.isbn) {
                bookList.push({
                  isbn: book.isbn,
                  title: book.title,
                  author: book.author,
                  url: book.url,
                  cover: book.cover,
                  publisher: book.publisher,
                  added: true,
                })
              }
            })
            homepage.setData({
              bookList: bookList,
              showEmpty: bookList.length == 0,
            })
            showToast('删除成功')
          }
        }, (failure) => {
          hideLoading()
        })
      }
    })
  },
})
