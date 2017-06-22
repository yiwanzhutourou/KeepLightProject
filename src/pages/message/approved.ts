import { BorrowHistory, UserContact } from '../../api/interfaces'
import { getMyApprovedRequest, getUserContactByRequest } from '../../api/api'
import { hideLoading, showDialog, showLoading, showToast } from '../../utils/utils'

let approvedPage

Page({
  data: {
    approvedList: [],
    showList: false,
    showEmpty: false,
    isFromMe: true,
  },

  onLoad: function(options: any): void {
    approvedPage = this
    approvedPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载')
    getMyApprovedRequest((list: Array<BorrowHistory>) => {
      hideLoading()
      approvedPage.setData({
        approvedList: approvedPage.formatList(list),
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
    }, (failure) => {
      hideLoading()
    })
  },

  onRequestItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  formatList: (list: Array<BorrowHistory>) => {
    let formattedList = new Array()
    list.forEach((request: BorrowHistory) => {
      formattedList.push({
        title: '书友' + request.user + '同意了您的借阅请求',
        subtitle: '《' + request.bookTitle + '》',
        userId: request.userId,
        bookCover: request.bookCover,
        date: request.date,
        requestId: request.requestId,
        status: request.status,
        nickname: request.user,
      })
    })
    return formattedList
  },

  onContactTap: (e) => {
    let requestId = e.currentTarget.dataset.requestid
    let usernick = e.currentTarget.dataset.usernick as string
    showLoading('正在加载')
    getUserContactByRequest(requestId, (contact: UserContact) => {
      hideLoading()
      if (contact && contact.name && contact.contact) {
        wx.showModal({
          title: usernick + '的联系方式',
          content: contact.name + '：' + contact.contact,
          confirmText: '点击复制',
          success: (res) => {
            if (res && res.confirm) {
              wx.setClipboardData({
                data: contact.contact,
                success: (result) => {
                  showToast(contact.name + '已复制')
                },
              })
            }
          },
        })
      } else {
        showDialog('抱歉，书房主人好像没有留下联系方式')
      }
    }, () => {
      hideLoading()
    })
  },
})
