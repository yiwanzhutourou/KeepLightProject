import { getScreenSizeInRpx } from '../../utils/utils'
import { setShowLanding } from '../../utils/urlCache'

let landingPage

Page({
  data: {
    screenHeight: 0,
    landings: [
      'http://othb16dht.bkt.clouddn.com/landing1.png',
      'http://othb16dht.bkt.clouddn.com/landing2.png',
      'http://othb16dht.bkt.clouddn.com/landing3.png',
      'http://othb16dht.bkt.clouddn.com/landing4.png',
    ],
  },

  onLoad: function(): void {
    landingPage = this
    landingPage.setData({
      screenHeight: getScreenSizeInRpx().height,
    })
    setShowLanding()
  },

  onConfirmTap: () => {
    wx.navigateBack({
      delta: 1,
    })
  },
})
