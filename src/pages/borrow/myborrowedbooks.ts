import { getMyOutBorrowRequests, returnBook } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading, timestamp2TextComplex } from '../../utils/utils'

import { BorrowRequestNew } from '../../api/interfaces'

let myBorrowedBooksPage

const parseDataList = (data: Array<BorrowRequestNew>) => {
  if (data && data.length > 0) {
    data.forEach((request: BorrowRequestNew) => {
       request.status = parseInt('' + request.status, 10)
       request.timeString = timestamp2TextComplex(request.timestamp)
    })
  }
  return data
}

Page({
  data: {
    showFlag: 1,
    dataList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
    isOut: false,
  },
  
  onLoad: function(option: any): void {
    myBorrowedBooksPage = this
    myBorrowedBooksPage.loadData()
  },

  onShowFlag: (e) => {
    let oldShowFlag = parseInt(myBorrowedBooksPage.data.showFlag, 10)
    let newShowFlag = parseInt(e.currentTarget.dataset.flag, 10)
    if (oldShowFlag === newShowFlag) {
      return
    }
    myBorrowedBooksPage.setData({
      showFlag: newShowFlag,
    })
    myBorrowedBooksPage.loadData()
  },

  loadData: () => {
    myBorrowedBooksPage.setData({
      dataList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
    })
    showLoading('正在加载...')
    let flag = myBorrowedBooksPage.data.showFlag
    getMyOutBorrowRequests(flag, (data: Array<BorrowRequestNew>) => {
      hideLoading()
      myBorrowedBooksPage.setData({
        dataList: parseDataList(data),
        showEmpty: data.length == 0,
        showList: data.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myBorrowedBooksPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    myBorrowedBooksPage.loadData()
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onUserTap: (e) => {
    let user = e.currentTarget.dataset.user
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + user,
    })
  },

  onReturnBook: (e) => {
    let id = e.currentTarget.dataset.id
    let user = e.currentTarget.dataset.user
    let isbn = e.currentTarget.dataset.isbn
    if (id && user && isbn) {
      showConfirmDialog('', '请确认归还图书之后再进行这个操作。是否继续？', (confirm) => {
        if (confirm) {
          showLoading('正在操作...')
          returnBook(id, user, isbn, () => {
            hideLoading()
            myBorrowedBooksPage.loadData()
          }, (failure) => {
            hideLoading()
            if (!failure.data) {
              showErrDialog('操作失败，请检查你的网络')
            }
          })
        }
      })
    }
  },
})
