import { acceptBorrow, declineBorrow, getMyOutBorrowRequests } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading, timestamp2TextComplex } from '../../utils/utils'

import { BorrowRequestNew } from '../../api/interfaces'

let myoutrequestsPage

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
    showFlag: 0,
    dataList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
    isOut: true, // 用在 GeneralBorrowItem 上用来区分是借出还是借入
  },
  
  onLoad: function(option: any): void {
    myoutrequestsPage = this
    myoutrequestsPage.loadData()
  },

  onShowFlag: (e) => {
    let oldShowFlag = parseInt(myoutrequestsPage.data.showFlag, 10)
    let newShowFlag = parseInt(e.currentTarget.dataset.flag, 10)
    if (oldShowFlag === newShowFlag) {
      return
    }
    myoutrequestsPage.setData({
      showFlag: newShowFlag,
    })
    myoutrequestsPage.loadData()
  },

  loadData: () => {
    myoutrequestsPage.setData({
      dataList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
    })
    showLoading('正在加载...')
    let flag = myoutrequestsPage.data.showFlag
    getMyOutBorrowRequests(flag, (data: Array<BorrowRequestNew>) => {
      hideLoading()
      myoutrequestsPage.setData({
        dataList: parseDataList(data),
        showEmpty: data.length == 0,
        showList: data.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myoutrequestsPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    myoutrequestsPage.loadData()
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
})
