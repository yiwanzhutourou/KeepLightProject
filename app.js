//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  // 用户信息
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  // 定位信息
  getLocationInfo: function(cb) {
    var that = this;
    if (this.globalData.locationInfo) {
        cb(this.globalData.locationInfo)
    } else {
        wx.getLocation({
          type: 'gcj02',
          success: function(res) {
            that.globalData.locationInfo = res;
            cb(that.globalData.locationInfo)
          }
        })
    }
  },
  // 设备信息（屏幕宽高等）
  getSystemInfo: function(cb) {
    var that = this;
    if (this.globalData.systemInfo) {
        cb(this.globalData.systemInfo)
    } else {
        wx.getSystemInfo({
          success: function(res) {
            that.globalData.systemInfo = res;
            cb(that.globalData.systemInfo)
          }
        })
    }
  },
  globalData: {
    userInfo: null,
    locationInfo: null,
    systemInfo: null
  }
})