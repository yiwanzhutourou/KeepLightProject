import { getBookList, removeBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading } from '../../utils/utils'
import { replaceBookList, updateBookStatus } from '../../utils/bookCache'

import { Book } from '../../api/interfaces'

let mybooksPage

Page({
  data: {
    isHomePage: true, // always true
    // 我的书房页面，这两个参数一直是true
    isCurrentUser: true,
    isMyPage: true, // always true

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

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    getBookList('', (books: Array<Book>) => {
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
    let book: Book = e.currentTarget.dataset.book
    let userId = mybooksPage.data.userId
    wx.navigateTo({
        url: '../book/book?isbn=' + book.isbn
                + '&showBorrowBook=' + !mybooksPage.data.isCurrentUser
                + '&belongTo=' + userId,
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
            if (mybooksPage.data.isCurrentUser) {
              updateBookStatus(isbn, false)
            }
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
