import { Book, DEFAULT_PAGE_SIZE, Result } from '../../api/interfaces'
import { addBook, getBookInfo, getBookList, searchBooks } from '../../api/api'
import { filterBookListByStatus, updateBookStatus, updateBookStatusByList } from '../../utils/bookCache'
import { getScreenSizeInRpx, hideLoading, showDialog, showErrDialog, showLoading, showToast } from '../../utils/utils'

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
  },

  onLoad: function(options: any): void {
    bookPage = this
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
    let book: Book = e.currentTarget.dataset.book

    wx.navigateTo({
        url: '../book/book?title='
                  + book.title
                  + '&isbn=' + book.isbn
                  + '&showAddBook=' + true
                  + '&isAdded=' + book.added,
    })
  },

  onAddBook: (e) => {
    showLoading('正在添加')
    addBook(e.currentTarget.dataset.book.isbn, (isbn: string) => {
      hideLoading()
      if (bookPage.data.bookList) {
        let bookList: Array<Book> = []
        bookPage.data.bookList.forEach((book: Book) => {
          let added = book.added
          if (isbn === book.isbn) {
            added = true
          }
          bookList.push({
              isbn: book.isbn,
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
        updateBookStatus(isbn, true)
        showToast('添加成功')
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
          getBookInfo(res.result, (books: Array<Book>) => {
              hideLoading()
              bookPage.setData({
                keyword: '',
                showLoadingMore: false,
                noMore: true,
              })
              bookPage.handleSearchResult(books)
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
    searchBooks(keyword, INITIAL_PAGE, DEFAULT_PAGE_SIZE, (books: Array<Book>) => {
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

  handleSearchResult: (bookList: Array<Book>) => {
    if (!bookList || bookList.length == 0) {
      showDialog('搜索无结果')
    } else {
      bookPage.setData({
        bookList: bookList,
        showEmpty: false,
      })
      updateBookStatusByList(bookList)
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
    searchBooks(keyword, curPage, DEFAULT_PAGE_SIZE, (books: Array<Book>) => {
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
        updateBookStatusByList(books)
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
})
