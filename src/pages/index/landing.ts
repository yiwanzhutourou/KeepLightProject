import { getScreenSizeInRpx } from '../../utils/utils'
import { setShowLanding } from '../../utils/urlCache'

let landingPage

Page({
  data: {
    screenHeight: 0,
    landings: [
      '../../resources/img/landing1.png',
      '../../resources/img/landing2.png',
      '../../resources/img/landing3.png',
      '../../resources/img/landing4.png',
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
    wx.switchTab({
      url: '../homepage/homepage',
    })
  },
})
