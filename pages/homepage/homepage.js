// pages/homepage/homepage.js

var app = getApp()

Page({
  data:{
    userInfo: {},
    userShufangName: "",
    addressName: ""
  },
  onLoad: function(options) {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        userShufangName: userInfo.nickName + "的书房"
      })
    })
  },
  
  addBook: function() {
    wx.navigateTo({
      url: '../book/addBook'
    })
  },

  chooseLocation: function() {
    var that = this
    wx.chooseLocation({
      success: function(res) {
        // success
        that.setData({
          addressName: res.name
        })
        wx.showToast({
          title: '添加成功',
          duration: 2000
        })
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },
})