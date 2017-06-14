import { agreeRequest, getBorrowRequest } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showLoading } from '../../utils/utils'

import { BorrowRequest } from '../../api/interfaces'

let requestPage

Page({
  data: {
    requestList: [],
    showList: false,
    showEmpty: false,
  },

  onLoad: function(options: any): void {
    requestPage = this
    requestPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载')
    getBorrowRequest((list: Array<BorrowRequest>) => {
      console.log(list)
      hideLoading()
      requestPage.setData({
        requestList: requestPage.formatList(list),
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
    }, (failure) => {
      hideLoading()
    })
  },

  formatList: (list: Array<BorrowRequest>) => {
    let formattedList = new Array()
    list.forEach((request: BorrowRequest) => {
      formattedList.push({
        title: '书友' + request.fromUser + '想要借阅您的',
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

  onAgreeTap: (e) => {
    let requestId = e.currentTarget.dataset.request
    if (requestId) {
      showConfirmDialog('', '同意借阅请求后，对方将能通过您设置的联系方式联系您，确认继续？', (confirm) => {
        if (confirm) {
          showLoading('正在处理')
          agreeRequest(requestId, () => {
            hideLoading()
            let list = new Array()
            requestPage.data.requestList.forEach((request: any) => {
              if (request.requestId === requestId) {
                request.status = 1
              }
              list.push(request)
            })
            requestPage.setData({
              requestList: list,
            })
          }, () => {
            hideLoading()
          })
        }
      })
    }
  },
})
