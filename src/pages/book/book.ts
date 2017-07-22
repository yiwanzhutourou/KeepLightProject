import { addBook, borrowBook, getBookDetails } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading, showToast } from '../../utils/utils'

import { Book } from '../../api/interfaces'
import { parseAuthor } from '../../utils/bookUtils'
import { updateBookStatus } from '../../utils/bookCache'

let bookPage

Page({
  data: {
      bookDetail: null,
      showAddBook: false,
      showBorrowBook: false,
      belongTo: '',
      bookAdded: false,
      bookIsbn: '',
  },

  onLoad: function(option: any): void {
    bookPage = this

    if (!option || !option.isbn) {
        wx.navigateBack({
            delta: 1,
        })
    }
    if (option && option.title) {
        wx.setNavigationBarTitle({
            title: option.title,
        })
    }
    bookPage.setData({
        bookIsbn: option.isbn,
    })
    if (option.showBorrowBook === 'true'
            && option.belongTo !== 'undefined') {
        bookPage.setData({
            showBorrowBook: true,
            belongTo: option.belongTo,
        })
    } else if (option.showAddBook === 'true') {
        bookPage.setData({
            showAddBook: true,
            bookAdded: option.isAdded === 'true',
        })
    }

    showLoading('正在加载...')
    getBookDetails(option.isbn, (result: any) => {
        hideLoading()
        bookPage.setData({
            bookDetail: {
                bigImage: result.images.large,
                smallImage: result.image,
                title: result.title,
                author: parseAuthor(result.author, ' '),
                publisher: result.publisher ? '出版社：' + result.publisher : '',
                translator: result.translator ? '译者：' + result.translator : '',
                pubdate: result.pubdate ? '出版时间：' + result.pubdate : '',
                pages: result.pages ? '页数：' + result.pages : '',
                binding: result.binding ? '装帧：' + result.binding : '',
                series: result.series && result.series.title ? '丛书：' + result.series.title : '',
                isbn: result.isbn13 ? 'ISBN：' + result.isbn13 : '',
                summary: result.summary,
                author_intro: result.author_intro,
                catalog: result.catalog,
            },
        })
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('无法加载图书详情，请检查您的网络状态')
        }
    })
  },

  onBorrowBook: (e) => {
      let userId = bookPage.data.belongTo
      if (userId) {
        showConfirmDialog('借阅信息确认', '借阅书名：《' + bookPage.data.bookDetail.title + '》\n将会向书房主人发送一条借阅请求，确认继续？', (confirm: boolean) => {
            if (confirm) {
                let formId = e.detail.formId
                let isbn = bookPage.data.bookIsbn
                if (isbn) {
                    showLoading('正在发送借书请求')
                    borrowBook(userId, isbn, formId,
                        () => {
                        hideLoading()
                        showDialog('借书请求已发送，请等待书的主人回复~')
                    }, (failure) => {
                        hideLoading()
                        if (!failure.data) {
                            showErrDialog('无法借阅，请检查您的网络状态')
                        }
                    })
                }
            }
        })
      }
  },

  onAddBook: (e) => {
    let bookIsbn = bookPage.data.bookIsbn
    if (!bookIsbn || bookIsbn === '') {
        return
    }
    showLoading('正在添加')
    addBook(bookIsbn, (isbn: string) => {
        hideLoading()
        let added = false
        if (isbn === bookPage.data.bookIsbn) {
            added = true
        }
        bookPage.setData({
            bookAdded: added,
        })
        updateBookStatus(isbn, true)
        if (added) {
            showToast('添加成功')
        }
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('无法添加图书，请检查您的网络状态')
        }
    })
  },
})
