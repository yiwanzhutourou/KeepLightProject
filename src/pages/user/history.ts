import { BorrowHistory, UserContact } from '../../api/interfaces'
import { getBorrowHistory, getUserContactByRequest } from '../../api/api'
import { hideLoading, showDialog, showLoading, showToast } from '../../utils/utils'

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
      hideLoading()
      historyPage.setData({
        historyList: list,
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
    }, (failure) => {
      hideLoading()
    })
  },

  onHistoryItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onActionTap: (e) => {
    let requestId = e.currentTarget.dataset.requestid
    let usernick = e.currentTarget.dataset.usernick as string
    showLoading('正在加载')
    getUserContactByRequest(requestId, (contact: UserContact) => {
      hideLoading()
      if (contact && contact.name && contact.contact) {
        wx.showModal({
          title: (usernick.length > 3 ? usernick.substring(0, usernick.length - 3) : usernick) + '的联系方式',
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
