import { borrowBook, borrowBookNew } from '../../api/api'
import { hideLoading, showErrDialog, showLoading } from '../../utils/utils'

import { getBorrowData } from '../../utils/bookCache'

let borrowPage

Page({
  data: {
      user: {},
      book: {},
  },

  onLoad: function(options: any): void {
    borrowPage = this
    let data = getBorrowData()
    borrowPage.setData({
        user: data.user,
        book: data.book,
    })
  },

  onBorrowBook: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    let userId = e.currentTarget.dataset.user
    if (isbn && userId) {
        let message = e.detail.value.message
        showLoading('正在发送借书请求')
        borrowBookNew(userId, isbn, message,
        () => {
            hideLoading()
            wx.showModal({
                title: '',
                content: '发送成功',
                confirmText: '查看详情',
                cancelText: '返回',
                success: (res) => {
                    if (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '../chat/chat?otherId=' + borrowPage.data.user.id,
                            })
                        } else {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }
                    }
                },
            })
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('无法借阅，请检查你的网络')
            }
        })
    }
  },
})
