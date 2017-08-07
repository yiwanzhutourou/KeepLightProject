import { getScreenSizeInRpx } from '../../utils/utils'
import { setShowLanding } from '../../utils/urlCache'

let landingPage

Page({
  data: {
    screenHeight: 0,
    landings: [
      'http://othb16dht.bkt.clouddn.com/open1.png',
      'http://othb16dht.bkt.clouddn.com/open2.png',
      'http://othb16dht.bkt.clouddn.com/open3.png',
      'http://othb16dht.bkt.clouddn.com/open4.png',
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
