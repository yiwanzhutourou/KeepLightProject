import { clearPostModifyData } from '../../utils/postCache'
import { getScreenSizeInRpx } from '../../utils/utils'
import { getShowPostBtn } from '../../utils/discoverCache'

let app = getApp()
let postIndexPage

Page({
  data: {
    screenHeight: 0,
    showPostBtn: false,
  },

  onLoad: function(): void {
    postIndexPage = this
    
    app.getSystemInfo((systemInfo: WeApp.SystemInfo) => {
      postIndexPage.setData({
        screenHeight: systemInfo.windowHeight,
      })
    })
  },

  onShow: () => {
    let showPost = getShowPostBtn()
    postIndexPage.setData({
      showPostBtn: showPost,
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
