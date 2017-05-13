// pages/homepage/homepage.js

let homepage

Page({
  data: {
    userInfo: {},
    userShufangName: '',
    addressName: '',
  },
  onLoad: function(): void {
    homepage = this
    // 调用应用实例的方法获取全局数据
    getApp().getUserInfo((userInfo: any) => {
      // 更新数据
      homepage.setData({
        userInfo: userInfo,
        userShufangName: userInfo.nickName + '的书房',
      })
    })
  },
  
  addBook: () => {
    wx.navigateTo({
      url: '../book/addBook',
    })
  },

  chooseLocation: () => {
    wx.chooseLocation({
      success: (res: WeApp.ChoosedLoaction) => {
        // success
        homepage.setData({
          addressName: res.name,
        })
        wx.showToast({
          title: '添加成功',
          duration: 2000,
        })
      },
    })
  },
})
