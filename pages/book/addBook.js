// pages/book/addBook.js

var util = require('../../utils/util.js')

Page({
  data:{
    code: "",
    codeType: ""
  },

  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },

  scanISBN: function() {
    var that = this
    wx.scanCode({
      success: function(res) {
        // success
        that.setData({
          code: res.result,
          codeType: res.scanType
        })
        if (res.scanType !== 'EAN_13') {
            wx.showModal({
              title: '提示',
              content: '无法获取图书ISBN',
              showCancel: false
            })
        }
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: '无法获取图书ISBN',
          showCancel: false
        })
      },
    })
  }
})