import { getBookList, removeBook } from '../../api/api'
import { getBorrowData, replaceBookList, updateBookStatus, updateBorrowData } from '../../utils/bookCache'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading } from '../../utils/utils'

import { Book } from '../../api/interfaces'
import { parseAuthor } from '../../utils/bookUtils'

let userbooksPage

Page({
  data: {
    showAll: true,
    userId: 0,
    bookList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(option: any): void {
    userbooksPage = this

    if (!option || !option.user) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }
    userbooksPage.setData({
        userId: option.user,
        showAll: option.showAll && option.showAll === '1',
    })
  },

  onShow: function (): void {
    userbooksPage.loadData()
  },

  onShowAll: (e) => {
    if (userbooksPage.data.showAll) {
      return
    }
    userbooksPage.setData({
      showAll: true,
    })
    userbooksPage.loadData()
  },

  onShowIdle: (e) => {
    if (!userbooksPage.data.showAll) {
      return
    }
    userbooksPage.setData({
      showAll: false,
    })
    userbooksPage.loadData()
  },

  loadData: () => {
    getBookList(userbooksPage.data.userId, userbooksPage.data.showAll, (books: Array<Book>) => {
      hideLoading()
      userbooksPage.setData({
        bookList: books,
        showEmpty: books.length == 0,
        showList: books.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        userbooksPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    userbooksPage.loadData()
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onBorrowBook: (e) => {
    let book = e.currentTarget.dataset.book
    let borrowData = getBorrowData()
    if (book && borrowData && borrowData.user) {
      updateBorrowData({
        user: borrowData.user,
        book: {
          isbn: book.isbn,
          title: book.title,
          author: parseAuthor(book.author, ' '),
          cover: book.cover,
          publisher: book.publisher,
        },
      })
      wx.navigateTo({
        url: '../chat/borrow',
      })
    }
  },
})
