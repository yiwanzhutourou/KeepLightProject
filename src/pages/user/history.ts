import { hideLoading, showErrDialog, showLoading } from '../../utils/utils'

import { BorrowHistory } from '../../api/interfaces'
import { getBorrowHistory } from '../../api/api'

let historyPage

Page({
  data: {
    historyList: [],
    showList: false,
    showEmpty: false,
  },

  onLoad: function(options: any): void {
    historyPage = this
    historyPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载')
    getBorrowHistory((list: Array<BorrowHistory>) => {
      console.log(list)
      hideLoading()
      historyPage.setData({
        historyList: list,
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
    }, (failure) => {
      hideLoading()
      showErrDialog('无法获取数据，请检查您的网络~')
    })
  },

  onHistoryItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage?user=' + e.currentTarget.dataset.user,
    })
  },
})
