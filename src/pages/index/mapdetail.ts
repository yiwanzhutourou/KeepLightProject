import { SearchUser } from '../../api/interfaces'
import { getMapDetails } from '../../api/api'

Page({
  data: {
    bookshelves: [],
    showBorrowButton: false,
  },

  onLoad: function(option): void {
    // 获取书房信息
    const users = option.users

    const that = this
    getMapDetails(
      users,
      (result: Array<SearchUser>) => {
        that.setData({ bookshelves: result })
      }
    )
  },

  onUserItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onShow: function(): void {

  },

})
