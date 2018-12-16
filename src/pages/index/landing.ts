import { getScreenSizeInRpx } from '../../utils/utils'
import { setShowLanding } from '../../utils/urlCache'

let landingPage

Page({
  data: {
    screenHeight: 0,
    landings: [
      'http://pic.youdushufang.com/open1.png',
      'http://pic.youdushufang.com/open2.png',
      'http://pic.youdushufang.com/open3.png',
      'http://pic.youdushufang.com/open4.png',
    ],
  },

  onLoad: function(): void {
    landingPage = this
    let screen = getScreenSizeInRpx()
    landingPage.setData({
      screenHeight: screen.height,
      screenWidth: screen.width,
    })
    setShowLanding()
  },

  onConfirmTap: () => {
    wx.switchTab({
      url: '../user/mine',
    })
  },

  onShareAppMessage: () => {
    return {
      title: '有读书房',
      path: 'pages/index/landing',
    }
  },
})
