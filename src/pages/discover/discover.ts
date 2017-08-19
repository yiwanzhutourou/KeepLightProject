
let discoverPage

Page({
  data: {},

  onLoad: function(options: any): void {
      discoverPage = this
  },

  onPost: (e) => {
      wx.navigateTo({
          url: '../card/post',
      })
  },
})
