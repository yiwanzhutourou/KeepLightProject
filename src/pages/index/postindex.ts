import { clearPostModifyData } from '../../utils/postCache'
import { getScreenSizeInRpx } from '../../utils/utils'

let app = getApp()
let postIndexPage

Page({
  data: {
    screenHeight: 0,
  },

  onLoad: function(): void {
    postIndexPage = this
    
    app.getSystemInfo((systemInfo: WeApp.SystemInfo) => {
      postIndexPage.setData({
        screenHeight: systemInfo.windowHeight,
      })
    })
  },

  onAddBook: (e) => {
    wx.navigateTo({
      url: '../book/addBook',
    })
  },

  onPostCard: (e) => {
    clearPostModifyData()
    wx.navigateTo({
        url: '../card/post',
    })
  },
})
