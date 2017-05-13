// index.js

const EVENT_TAP_HOME_PAGE = 1
const EVENT_TAP_SHOW_CURRENT_LOCATION = 2

let app = getApp()
let indexPage
let mapCtx
let windowWidth
let windowHeight

Page({
  data: {
    longitude: 0,
    latitude: 0,
    controls: [],
  },

  onLoad: function(): void {
    indexPage = this

    // 使用 wx.createMapContext 获取 map 上下文 
    mapCtx = wx.createMapContext('homeMap')

    // 获取屏幕宽高
    app.getSystemInfo((systemInfo: WeApp.SystemInfo) => {
        windowWidth = systemInfo.windowWidth
        windowHeight = systemInfo.windowHeight
        indexPage.setUpIconOnmap()
    })

    // 获取定位
    app.getLocationInfo((locationInfo: WeApp.LocationInfo) => {
        indexPage.setData({
          longitude: locationInfo.longitude,
          latitude: locationInfo.latitude,
        })
    })
  },

  controltap: (event) => {
    if (EVENT_TAP_HOME_PAGE == event.controlId) {
      // nav to user homepage
      wx.navigateTo({
        url: '../homepage/homepage',
      })
    } else if (EVENT_TAP_SHOW_CURRENT_LOCATION == event.controlId) {
      mapCtx.moveToLocation()
    }
  },

  // 计算地图上icon的位置，因为好像没有提供设置的居中的接口
  setUpIconOnmap: () => {
    // Homepage icon:
    let width = windowWidth * 0.3
    let height = width / 3.0
    let left = (windowWidth - width) / 2
    let top = windowHeight * 0.95 - height

    // Show current location icon:
    let cWidth = height
    let cHeight = height
    let cLeft = windowWidth * 0.95 - cWidth
    let cTop = top

    indexPage.setData({
      controls: [
        // 进入主页
        {
          id: EVENT_TAP_HOME_PAGE,
          iconPath: '/resources/img/icon_homepage.png',
          position: {
            left: left,
            top: top,
            width: width,
            height: height,
          },
          clickable: true,
        },
        // 显示当前位置
        {
          id: EVENT_TAP_SHOW_CURRENT_LOCATION,
          iconPath: '/resources/img/icon_current_location.png',
          position: {
            left: cLeft,
            top: cTop,
            width: cWidth,
            height: cHeight,
          },
          clickable: true,
        },
      ],
    })
  },
})
