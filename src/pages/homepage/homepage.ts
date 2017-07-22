import { Book, HomepageData } from '../../api/interfaces'
import { addAddress, borrowBook, getBookList, getHomepageData, getMyHomepageData, removeBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading, showToast } from '../../utils/utils'
import { replaceBookList, updateBookStatus } from '../../utils/bookCache'

let homepage

Page({
  data: {
    isHomePage: true, // always true
    // 我的书房页面，这两个参数一直是true
    isCurrentUser: true,
    isMyPage: true, // always true

    homepageData: {},
    bookList: [],
    showEmpty: false,
  },
  
  onLoad: function(option: any): void {
    homepage = this
  },

  onShow: function (): void {
      homepage.loadData()
  },

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    getMyHomepageData((result: HomepageData) => {
      hideLoading()
      let books = result.books
      homepage.setData({
        homepageData: {
          nickName: result.nickname + '的书房',
          avatarUrl: result.avatar ? result.avatar : '/resources/img/default_avatar.png',
          userIntro: result.info,
        },
        bookList: books,
        showEmpty: books.length == 0,
      })
      replaceBookList(books)
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法加载，请检查您的网络')
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
            if (homepage.data.isCurrentUser) {
              updateBookStatus(isbn, false)
            }
            showToast('删除成功')
          }
        }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法删除图书，请检查您的网络')
          }
        })
      }
    })
  },

  onShareAppMessage: () => {
    if (homepage.data.homepageData) {
      return {
        title: homepage.data.homepageData.nickName,
        path: 'pages/homepage/homepage2?user=' + homepage.data.userId,
      }
    } else {
      return {
        title: '有读书房',
        path: 'pages/index/index',
      }
    }
  },
})
