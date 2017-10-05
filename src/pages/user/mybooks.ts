import { getBookList, markBook, removeBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading } from '../../utils/utils'
import { replaceBookList, updateBookStatus } from '../../utils/bookCache'

import { Book } from '../../api/interfaces'

let mybooksPage

Page({
  data: {
    showAll: true,
    bookList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(option: any): void {
    mybooksPage = this
  },

  onShow: function (): void {
    mybooksPage.loadData()
  },

  onShowAll: (e) => {
    if (mybooksPage.data.showAll) {
      return
    }
    mybooksPage.setData({
      showAll: true,
    })
    mybooksPage.loadData()
  },

  onShowIdle: (e) => {
    if (!mybooksPage.data.showAll) {
      return
    }
    mybooksPage.setData({
      showAll: false,
    })
    mybooksPage.loadData()
  },

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    getBookList('', mybooksPage.data.showAll, (books: Array<Book>) => {
      hideLoading()
      mybooksPage.setData({
        bookList: books,
        showEmpty: books.length == 0,
        showList: books.length > 0,
      })
      replaceBookList(books)
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        mybooksPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    mybooksPage.loadData()
  },

  onUploadBook: (e) => {
    wx.switchTab({
      url: '../book/addBook',
    })
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onMarkBookUnIdle: (e) => {
    showLoading('正在移除闲置书')
    let isbn = e.currentTarget.dataset.isbn
    markBook(isbn, false, (result: string) => {
      hideLoading()
      if (mybooksPage.data.bookList) {
        let bookList: Array<Book> = []
        mybooksPage.data.bookList.forEach((book: Book) => {
          if (isbn === book.isbn) {
            book.canBorrow = false
          }
          bookList.push(book)
        })
        mybooksPage.setData({
          bookList: bookList,
        })
      }
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法删除图书，请检查你的网络')
      }
    })
  },

  onMarkBookIdle: (e) => {
    showLoading('正在标记图书为闲置书')
    let isbn = e.currentTarget.dataset.isbn
    markBook(isbn, true, (result: string) => {
      hideLoading()
      if (mybooksPage.data.bookList) {
        let bookList: Array<Book> = []
        mybooksPage.data.bookList.forEach((book: Book) => {
          if (isbn === book.isbn) {
            book.canBorrow = true
          }
          bookList.push(book)
        })
        mybooksPage.setData({
          bookList: bookList,
        })
      }
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法删除图书，请检查你的网络')
      }
    })
  },

  onRemoveBook: (e) => {
    showConfirmDialog('', '确认移除《' + e.currentTarget.dataset.title + '》？', (confirm: boolean) => {
      if (confirm) {
        showLoading('正在删除')
        removeBook(e.currentTarget.dataset.isbn, (isbn: string) => {
          hideLoading()
          if (mybooksPage.data.bookList) {
            let bookList: Array<Book> = []
            mybooksPage.data.bookList.forEach((book: Book) => {
              if (isbn !== book.isbn) {
                book.added = true
                bookList.push(book)
              }
            })
            mybooksPage.setData({
              bookList: bookList,
              showEmpty: bookList.length == 0,
              showList: bookList.length > 0,
            })
            updateBookStatus(isbn, false)
          }
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
