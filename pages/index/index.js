//index.js
//获取应用实例
const EVENT_TAP_HOME_PAGE = 1
const EVENT_TAP_SHOW_CURRENT_LOCATION = 2

var app = getApp()

Page({
  data: {
    longitude: 0,
    latitude: 0,
    controls: null
  },

  onLoad: function() {
    // 使用 wx.createMapContext 获取 map 上下文 
    this.mapCtx = wx.createMapContext('homeMap')

    var that = this
    // 获取屏幕宽高
    app.getSystemInfo(function(systemInfo) {
        that.windowWidth = systemInfo.windowWidth
        that.windowHeight = systemInfo.windowHeight
        that.setUpIconOnmap()
    })

    // 获取定位
    app.getLocationInfo(function(locationInfo) {
        that.setData({
          longitude: locationInfo.longitude,
          latitude: locationInfo.latitude
        })
    })
  },

  controltap: function(event) {
    if (EVENT_TAP_HOME_PAGE == event.controlId) {
      // nav to user homepage
      wx.navigateTo({
        url: '../homepage/homepage'
      })
    } else if (EVENT_TAP_SHOW_CURRENT_LOCATION == event.controlId) {
      this.mapCtx.moveToLocation()
    }
  },

  // 计算地图上icon的位置，因为好像没有提供设置的居中的接口
  setUpIconOnmap: function() {
    // Homepage icon:
    var width = this.windowWidth * 0.3
    var height = width / 3.0
    var left = (this.windowWidth - width) / 2
    var top = this.windowHeight * 0.95 - height

    // Show current location icon:
    var cWidth = height
    var cHeight = height
    var cLeft = this.windowWidth * 0.95 - cWidth
    var cTop = top

    this.setData({
      controls: [
        // 进入主页
        {
          id: EVENT_TAP_HOME_PAGE,
          iconPath: "/resources/img/icon_homepage.png",
          position: {
            left: left,
            top: top,
            width: width,
            height: height
          },
          clickable: true
        },
        // 显示当前位置
        {
          id: EVENT_TAP_SHOW_CURRENT_LOCATION,
          iconPath: "/resources/img/icon_current_location.png",
          position: {
            left: cLeft,
            top: cTop,
            width: cWidth,
            height: cHeight
          },
          clickable: true
        }
      ]
    })
  }
})
