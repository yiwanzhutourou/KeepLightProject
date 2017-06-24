Page({
  data: {
  },

  onLoad: function(options: any): void {
    // do nothing
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

  onShareAppMessage: () => {
    return {
      title: '有读书房',
      path: 'pages/about/about',
    }
  },
})
