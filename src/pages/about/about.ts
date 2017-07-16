let aboutPage
let lastLogoTap = -1
let logoTapCount = 0

Page({
  data: {
  },

  onLoad: function(options: any): void {
    aboutPage = this
  },

  onShow: function (): void {
    lastLogoTap = -1
    logoTapCount = 0
  },

  onRightTap: (e) => {
    wx.navigateTo({
        url: '../about/legals?content=rights',
    })
  },

  onLegalTap: (e) => {
    wx.navigateTo({
        url: '../about/legals?content=legals',
    })
  },

  onLogoTap: (e) => {
    if (lastLogoTap === -1 || (e.timeStamp && (e.timeStamp - lastLogoTap) < 500)) {
      logoTapCount++
    } else {
      logoTapCount = 1
    }
    if (logoTapCount === 5) {
      lastLogoTap = -1
      logoTapCount = 0
      wx.navigateTo({
          url: '../about/untergrund',
      })
    } else {
      lastLogoTap = e.timeStamp
    }
  },

  onShareAppMessage: () => {
    return {
      title: '有读书房',
      path: 'pages/about/about',
    }
  },
})
