import { getBorrowRequest, updateRequest } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showLoading } from '../../utils/utils'

import { BorrowRequest } from '../../api/interfaces'

let requestPage

const STATUS_AGREE = 1
const STATUS_DECLINE = 2
const STATUS_DISMISS = 3

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

  onAgree: (requestId: number) => {
    showConfirmDialog('', '同意借阅请求后，对方将能通过您设置的联系方式联系您，确认继续？', (confirm) => {
      if (confirm) {
        showLoading('正在处理')
        updateRequest(requestId, STATUS_AGREE, () => {
          hideLoading()
          requestPage.loadData()
        }, () => {
          hideLoading()
        })
      }
    })
  },

  onDecline: (requestId: number) => {
    showConfirmDialog('', '确定拒绝？', (confirm) => {
      if (confirm) {
        showLoading('正在处理')
        updateRequest(requestId, STATUS_DECLINE, () => {
          hideLoading()
          requestPage.loadData()
        }, () => {
          hideLoading()
        })
      }
    })
  },

  onDismiss: (requestId: number) => {
    showConfirmDialog('', '确认忽略？', (confirm) => {
      if (confirm) {
        showLoading('正在处理')
        updateRequest(requestId, STATUS_DISMISS, () => {
          hideLoading()
          requestPage.loadData()
        }, () => {
          hideLoading()
        })
      }
    })
  },

  onActionTap: (e) => {
    let requestId = e.currentTarget.dataset.requestid
    wx.showActionSheet({
      itemList: ['同意', '拒绝', '忽略'],
      success: (res) => {
        let status = -1
        if (res) {
          switch (res.tapIndex) {
            case 0:
              requestPage.onAgree(requestId)
            break
            case 1:
              requestPage.onDecline(requestId)
            break
            case 2:
              requestPage.onDismiss(requestId)
            break
            default:
          }
        }
      },
      fail: (res) => {
        // do nothing
      },
    })
  },
})
