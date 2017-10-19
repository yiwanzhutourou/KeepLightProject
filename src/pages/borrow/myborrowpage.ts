import { Book, BorrowPageData } from '../../api/interfaces'
import { getBookInfo, getBorrowPageData, trueBorrowBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

let myborrowPage

Page({
  data: {
    userId: 0,
    avatar: '',
    nickname: '',
    bookList: [],
    showContent: false,
    showNetworkError: false,
  },

  onLoad: function(options: any): void {
    myborrowPage = this

    if (!options || !options.user) {
      wx.navigateBack({
        delta: 1,
      })
      return
    }

    myborrowPage.setData({
      userId: options.user,
    })
    
    myborrowPage.loadData()
  },

  onReload: (e) => {
    myborrowPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载...')
    let userId = myborrowPage.data.userId
    getBorrowPageData(userId, (data: BorrowPageData) => {
      hideLoading()
      myborrowPage.setData({
        avatar: data.avatar,
        nickname: data.nickname,
        bookList: data.books,
        showContent: true,
        showNetworkError: false,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myborrowPage.setData({
          showNetworkError: true,
          showContent: false,
        })
      }
    })
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onBorrowBook: (e) => {
    let book = e.currentTarget.dataset.book
    myborrowPage.internalBorrowBook(book.isbn, book.title)
  },

  onScanTap: (e) => {
    wx.scanCode({
      success: (res: WeApp.ScanCodeResult) => {
        if (!res) {
          showErrDialog('请扫描正确图书背面的 ISBN 码')
          return
        }
        if (res.scanType === 'EAN_13' && res.result) {
          // 图书页
          // 从豆瓣获取图书信息
          showLoading('正在查找图书信息')
          getBookInfo(res.result, (books: Array<Book>) => {
              hideLoading()
              if (books && books.length > 0 && books[0]) {
                myborrowPage.internalBorrowBook(books[0].isbn, books[0].title)
              } else {
                showErrDialog('无法获取图书信息，请尝试点击图书旁的借阅按钮借阅')
              }
            }, (failure) => {
              hideLoading()
              if (!failure.data) {
                showErrDialog('无法获取数据，请检查你的网络')
              }
          })
        } else {
          showErrDialog('请扫描正确图书背面的 ISBN 码')
        }
      },
    })
  },

  internalBorrowBook: (isbn, title) => {
    let titleText =  title ? '《' + title + '》' : '这本书'
    let nickname = myborrowPage.data.nickname
    showConfirmDialog('', '确认借阅' + nickname + '的' + titleText + '？',
      (confirm: boolean) => {
        if (confirm) {
          showLoading('正在发送借书请求')
          let userId = myborrowPage.data.userId
          trueBorrowBook(userId, isbn, () => {
            hideLoading()
            showDialog('借阅请求已发送，请提醒书的主人同意借阅请求后，再从对方那里拿走借阅的图书。请记得及时还书哦~')
          }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('请求失败，请检查你的网络')
            }
          })
        }
      },
    )
  },
})
