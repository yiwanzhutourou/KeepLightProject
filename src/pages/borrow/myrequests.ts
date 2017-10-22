import { acceptBorrow, declineBorrow, getMyBorrowRequests } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading, timestamp2Text } from '../../utils/utils'

import { BorrowRequestNew } from '../../api/interfaces'

let myrequestsPage

const parseDataList = (data: Array<BorrowRequestNew>) => {
  if (data && data.length > 0) {
    data.forEach((request: BorrowRequestNew) => {
       request.status = parseInt('' + request.status, 10)
       request.timeString = timestamp2Text(request.timestamp)
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
  },
  
  onLoad: function(option: any): void {
    myrequestsPage = this
    myrequestsPage.loadData()
  },

  onShowFlag: (e) => {
    let oldShowFlag = parseInt(myrequestsPage.data.showFlag, 10)
    let newShowFlag = parseInt(e.currentTarget.dataset.flag, 10)
    if (oldShowFlag === newShowFlag) {
      return
    }
    myrequestsPage.setData({
      showFlag: newShowFlag,
    })
    myrequestsPage.loadData()
  },

  loadData: () => {
    myrequestsPage.setData({
      dataList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
    })
    showLoading('正在加载...')
    let flag = myrequestsPage.data.showFlag
    getMyBorrowRequests(flag, (data: Array<BorrowRequestNew>) => {
      hideLoading()
      myrequestsPage.setData({
        dataList: parseDataList(data),
        showEmpty: data.length == 0,
        showList: data.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myrequestsPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    myrequestsPage.loadData()
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

  onDeclineBorrow: (e) => {
    let id = e.currentTarget.dataset.id
    let user = e.currentTarget.dataset.user
    let isbn = e.currentTarget.dataset.isbn
    if (id && user && isbn) {
      showConfirmDialog('', '确认拒绝？', (confirm) => {
        if (confirm) {
          showLoading('正在操作...')
          declineBorrow(id, user, isbn, () => {
            hideLoading()
            myrequestsPage.removeItem(id)
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

  onAcceptBorrow: (e) => {
    let id = e.currentTarget.dataset.id
    let user = e.currentTarget.dataset.user
    let isbn = e.currentTarget.dataset.isbn
    if (id && user && isbn) {
      showConfirmDialog('', '请确认已经将这本书当面交给了借书人，并且协商好了还书时间。继续操作？', (confirm) => {
        if (confirm) {
          showLoading('正在操作...')
          acceptBorrow(id, user, isbn, () => {
            hideLoading()
            myrequestsPage.removeItem(id)
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

  removeItem: (id: string) => {
    let dataList = myrequestsPage.data.dataList
    if (dataList) {
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i] && parseInt(dataList[i].id, 10) === parseInt(id, 10)) {
          dataList.splice(i, 1)
        }
      }
      myrequestsPage.setData({
        dataList: dataList,
        showEmpty: dataList.length == 0,
        showList: dataList.length > 0,
      })
    }
  },
})
