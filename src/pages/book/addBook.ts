import { Book, DEFAULT_PAGE_SIZE, Result } from '../../api/interfaces'
import { addBook, addNewBook, getBookDetailsByIsbn, getBookInfo, getBookList, searchBooks, searchDoubanBooks } from '../../api/api'
import { filterBookListByStatus, updateBookStatus, updateBookStatusByList } from '../../utils/bookCache'
import { getScreenSizeInRpx, hideLoading, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { setPostBookData } from '../../utils/postCache'

const INITIAL_PAGE = 0

let app = getApp()
let bookPage
let curPage = 0
let lastRequest = -1

Page({
  data: {
    bookList: [],
    keyword: '',
    screenHeight: 0,
    showLoadingMore: false,
    noMore: false,
    showEmpty: true,
    selectMode: false,
  },

  onLoad: function(options: any): void {
    bookPage = this
    if (options && options.mode && options.mode === 'select') {
      bookPage.setData({
        selectMode: true,
      })
    }
    bookPage.setData({
      screenHeight: getScreenSizeInRpx().height,
    })
  },

  onShow: function (): void {
      if (bookPage.data.bookList && bookPage.data.bookList.length > 0) {
        bookPage.setData({
          bookList: filterBookListByStatus(bookPage.data.bookList),
        })
      }
  },

  completeInput: (e) => {
    let keyword = e.detail.value
    if (!keyword || keyword === '') {
      showErrDialog('请输入关键字')
      return
    }
    curPage = 0
    bookPage.setData({
      keyword: keyword,
      showLoadingMore: false,
      noMore: false,
    })
    bookPage.searchBooks(keyword)
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn

    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onAddBook: (e) => {
    let book = e.currentTarget.dataset.book
    if (!book) {
      return
    }
    showLoading('正在添加')
    addNewBook(book, () => {
      hideLoading()
      showDialog('已添加')
      if (bookPage.data.bookList) {
        let bookList: Array<Book> = []
        // 更新已添加状态
        bookList = bookPage.data.bookList
        bookList.forEach((item: any) => {
          if (item.id === book.id) {
            item.added = true
          }
        })
        bookPage.setData({
          bookList: bookList,
        })
        // TODO 同其他
        // updateBookStatus(isbn, true)
      }
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法添加图书，请检查你的网络')
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
          getBookDetailsByIsbn(res.result, (book: any) => {
              hideLoading()
              bookPage.setData({
                keyword: '',
                showLoadingMore: false,
                noMore: true,
              })
              bookPage.handleSearchResult([book])
            }, (failure) => {
              hideLoading()
              if (!failure.data) {
                showErrDialog('网络错误，请稍后再试')
              }
          })
        }
      },
      fail: (res: any) => {
        showErrDialog('无法获取图书 ISBN')
      },
    })
  },

  searchBooks: (keyword: string) => {
    showLoading('正在搜索')
    searchDoubanBooks(keyword, INITIAL_PAGE, DEFAULT_PAGE_SIZE, (books: Array<any>) => {
        hideLoading()
        bookPage.setData({
          noMore: books.length < DEFAULT_PAGE_SIZE,
        })
        bookPage.handleSearchResult(books)
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
          showErrDialog('网络错误，请稍后再试')
        }
      })
  },

  handleSearchResult: (bookList: Array<any>) => {
    if (!bookList || bookList.length == 0) {
      showDialog('搜索无结果')
    } else {
      bookPage.setData({
        bookList: bookList,
        showEmpty: false,
      })
      // TODO 更新添加图书状态，这块重新做，之前写得乱七八糟的
      // updateBookStatusByList(bookList)
    }
  },

  onSearchInput: (e) => {
    bookPage.clearList()
  },

  clearList: () => {
    if (bookPage.data.bookList && bookPage.data.bookList.length > 0) {
      bookPage.setData({
        bookList: [],
        keyword: '',
        showLoadingMore: false,
        noMore: false,
        showEmpty: true,
      })
    }
  },

  onReachBottom: (e) => {
    let keyword = bookPage.data.keyword
    if (!keyword) {
      return
    }
    if (lastRequest != -1 && e.timeStamp && e.timeStamp - lastRequest < 500) {
      return
    }
    lastRequest = e.timeStamp
    if (bookPage.data.noMore) {
      return
    }
    bookPage.showLoadingMore()

    curPage++
    searchDoubanBooks(keyword, curPage, DEFAULT_PAGE_SIZE, (books: Array<any>) => {
        let noMore = (books.length < DEFAULT_PAGE_SIZE)
        if (noMore) {
          bookPage.showNoMore()
        } else {
          bookPage.hideLoadingMore()
          let list = bookPage.data.bookList
          bookPage.setData({
            bookList: list.concat(books),
          })
        }
        // TODO 同其他的
        // updateBookStatusByList(books)
      }, (failure) => {
        bookPage.hideLoadingMore()
        if (!failure.data) {
          showErrDialog('加载失败，请稍后再试')
        }
      })
  },

  showLoadingMore: () => {
    bookPage.setData({
      showLoadingMore: true,
    })
  },

  showNoMore: () => {
    bookPage.setData({
      showLoadingMore: true,
      noMore: true,
    })
  },

  hideLoadingMore: () => {
    bookPage.setData({
      showLoadingMore: false,
    })
  },

  onSelectBook: (e) => {
    let book = e.currentTarget.dataset.book
    setPostBookData({
      isbn: book.id,
      title: book.title,
      author: book.author,
      cover: book.image,
    })
    wx.navigateBack({
      delta: 1,
    })
  },
})
