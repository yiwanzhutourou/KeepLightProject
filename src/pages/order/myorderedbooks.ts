import { hideLoading, showLoading } from '../../utils/utils'

import { BorrowOrder } from '../../api/interfaces'
import { getMyBorrowOrders } from '../../api/api'

let myorderedbooksPage

Page({
  data: {
    dataList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
    isOut: false,
  },
  
  onLoad: function(option: any): void {
    myorderedbooksPage = this
    let isOut = option && option.out ? true : false
    if (isOut) {
      wx.setNavigationBarTitle({
        title: '借阅历史',
      })
    } else {
      wx.setNavigationBarTitle({
        title: '借阅请求',
      })
    }
    myorderedbooksPage.setData({
      isOut: isOut,
    })
    myorderedbooksPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载...')
    let out = myorderedbooksPage.data.isOut ? 1 : 0
    getMyBorrowOrders(out, (data: Array<BorrowOrder>) => {
      hideLoading()
      myorderedbooksPage.setData({
        dataList: data,
        showEmpty: data.length == 0,
        showList: data.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myorderedbooksPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    myorderedbooksPage.loadData()
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

  onChatTap: (e) => {
    let otherId = e.currentTarget.dataset.user
    if (otherId) {
        wx.navigateTo({
            url: '../chat/chat?otherId=' + otherId,
        })
    }
  },
})
