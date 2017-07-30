import { BorrowHistory, UserContact } from '../../api/interfaces'
import { getBorrowHistory, getUserContactByRequest } from '../../api/api'
import { hideLoading, showDialog, showLoading } from '../../utils/utils'

let historyPage

Page({
  data: {
    historyList: [],
    showList: false,
    showEmpty: false,
    showNetworkError: false,
  },

  onLoad: function(options: any): void {
    historyPage = this
  },

  onShow: function (): void {
    historyPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载')
    getBorrowHistory((list: Array<BorrowHistory>) => {
      hideLoading()
      historyPage.setData({
        historyList: list,
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        historyPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onHistoryItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },

  onReload: (e) => {
    historyPage.loadData()
  },
})
