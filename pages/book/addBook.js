// pages/book/addBook.js

var doubanapi = require('../../api/doubanapi.js')
var utils = require("../../utils/utils.js")
var bookUtils = require("../../utils/bookUtils.js")

Page({
  data:{
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
        if (res.scanType !== 'EAN_13' || !res.result) {
            utils.showDialog('无法获取图书ISBN')
        } else {
          // 从豆瓣获取图书信息
          utils.showLoading('正在查找图书信息')
          doubanapi.getBookInfo(res.result,
            function(success, data, statusCode) {
              utils.hideLoading()
              if (success && statusCode === 200) {
                var bookInfo = bookUtils.parseBookInfo(data)
                that.setData({
                  title: bookInfo.title,
                  author: bookInfo.author,
                  url: bookInfo.url,
                  imageSrc: bookInfo.cover
                })
              } else {
                utils.showDialog('无法获取图书信息')
              }
            }
          )
        }
      },
      fail: function(res) {
        utils.showDialog('无法获取图书ISBN')
      },
    })
  }
})