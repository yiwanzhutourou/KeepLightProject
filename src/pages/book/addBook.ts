import { Book, parseBookInfo, parseBookList } from '../../utils/bookUtils'
import { getBookInfoApi, searchBooksApi } from '../../test/backend'
import { hideLoading, showDialog, showErrDialog, showLoading, showToast } from '../../utils/utils'

import { addBook } from '../../api/api'

// pages/book/addBook.js
let bookPage

Page({
  data: {
    bookList: [],
  },

  onLoad: function(options: any): void {
    bookPage = this
  },

  completeInput: (e) => {
    let keyword = e.detail.value
    if (!keyword || keyword === '') {
      showErrDialog('请输入关键字')
      return
    }
    bookPage.searchBooks(keyword)
  },

  onBookItemTap: (e) => {
    // TODO: 微信小程序不支持WebView，需要一个图书详情页吗？
  },

  onAddBook: (e) => {
    showLoading('正在添加')
    addBook(e.currentTarget.dataset.book, (success: boolean, errMsg: string, result: Book) => {
      hideLoading()
      if (success && result) {
        if (bookPage.data.bookList) {
          let bookList: Array<Book> = []
          bookPage.data.bookList.forEach((book: Book) => {
            let added = book.added
            if (result.id === book.id) {
              added = true
            }
            bookList.push({
                id: book.id,
                title: book.title,
                author: book.author,
                url: book.url,
                cover: book.cover,
                publisher: book.publisher,
                added: added,
            })
          })
          bookPage.setData({
            bookList: bookList,
          })
          showToast('添加成功')
        }
      } else {
        showErrDialog('添加图书失败，请稍后再试')
      }
    })
  },

  scanISBN: () => {
    wx.scanCode({
      success: (res: WeApp.ScanCodeResult) => {
        // success
        bookPage.setData({
          code: res.result,
          codeType: res.scanType,
        })
        if (res.scanType !== 'EAN_13' || !res.result) {
            showErrDialog('无法获取图书 ISBN')
        } else {
          // 从豆瓣获取图书信息
          showLoading('正在查找图书信息')
          getBookInfoApi(res.result,
            (success: boolean, errMsg: string, statusCode: number, data: any) => {
              hideLoading()
              if (success && statusCode === 200) {
                bookPage.handleSearchResult(data.books)
              } else {
                showErrDialog('无法获取图书信息，请稍后再试')
              }
            },
          )
        }
      },
      fail: (res: any) => {
        showErrDialog('无法获取图书 ISBN')
      },
    })
  },

  searchBooks: (keyword: string) => {
    showLoading('正在搜索')
    searchBooksApi(keyword,
      (success: boolean, errMsg: string, statusCode: number, data: any) => {
        hideLoading()
        if (success && statusCode === 200) {
          bookPage.handleSearchResult(data.books)
        } else {
          showErrDialog('查询图书失败，请稍后再试')
        }
      })
  },

  handleSearchResult: (bookList: Array<Book>) => {
    if (!bookList || bookList.length == 0) {
      showDialog('搜索无结果')
    } else {
      bookPage.setData({
        bookList: bookList,
      })
    }
  },
})
