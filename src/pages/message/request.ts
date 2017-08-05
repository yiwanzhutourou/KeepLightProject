import { hideLoading, showLoading } from '../../utils/utils'

import { BorrowRequest } from '../../api/interfaces'
import { getBorrowRequest } from '../../api/api'

let requestPage

Page({
  data: {
    requestList: [],
    showList: false,
    showEmpty: false,
    showNetworkError: false,
    isFromMe: false,
  },

  onLoad: function(options: any): void {
    requestPage = this
    requestPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载')
    getBorrowRequest((list: Array<BorrowRequest>) => {
      hideLoading()
      requestPage.setData({
        requestList: requestPage.formatList(list),
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        requestPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    requestPage.loadData()
  },

  formatList: (list: Array<BorrowRequest>) => {
    let formattedList = new Array()
    list.forEach((request: BorrowRequest) => {
      formattedList.push({
        title: '书友' + request.fromUser + '想要借阅你的',
        subtitle: '《' + request.bookTitle + '》',
        userId: request.fromUserId,
        bookCover: request.bookCover,
        date: request.date,
        requestId: request.requestId,
        status: request.status,
      })
    })
    return formattedList
  },

  onRequestItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },
})
