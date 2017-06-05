import { Markers, Result } from '../../api/interfaces'
import { getMarkers, getUserInfo, getUserToken, login } from '../../api/api'
import { hideLoading, showErrDialog, showLoading } from '../../utils/utils'

// index.js

const EVENT_TAP_HOME_PAGE = 1
const EVENT_TAP_SHOW_CURRENT_LOCATION = 2
const EVENT_TAP_SETTINGS = 3

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
    markers: [],
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
  },

  onShow: function(): void {
    // 获取定位
    app.getLocationInfo((locationInfo: WeApp.LocationInfo) => {
        indexPage.setData({
          longitude: locationInfo.longitude,
          latitude: locationInfo.latitude,
        })

        getMarkers(
          (markers: Array<Markers>) => {
            indexPage.setData({
              markers: markers,
            })
          },
        ) 
    })
  },

  controltap: (event) => {
    if (EVENT_TAP_HOME_PAGE == event.controlId) {
      let token = getUserToken()
      let info = getUserInfo()
      if (token && info) {
        wx.navigateTo({
            url: '../homepage/homepage',
        })
      } else {
        showLoading('正在验证用户信息...')
        login((userInfo) => {
          hideLoading()
          if (userInfo) {
            // nav to user homepage
            wx.navigateTo({
              url: '../homepage/homepage',
            })
          } else {
            showErrDialog('获取微信账号信息失败，请稍后再试')
          }
        })
      }
    } else if (EVENT_TAP_SHOW_CURRENT_LOCATION == event.controlId) {
      mapCtx.moveToLocation()
    } else if (EVENT_TAP_SETTINGS == event.controlId) {
      let token = getUserToken()
      let info = getUserInfo()
      if (token && info) {
        wx.navigateTo({
            url: '../user/settings',
        })
      } else {
        showLoading('正在验证用户信息...')
        login((userInfo) => {
          hideLoading()
          if (userInfo) {
            // nav to user homepage
            wx.navigateTo({
              url: '../user/settings',
            })
          } else {
            showErrDialog('获取微信账号信息失败，请稍后再试')
          }
        })
      }
    }
  },

  markertap: (event) => {
    if (event && event.markerId) {
      wx.navigateTo({
          url: '../homepage/homepage?user=' + event.markerId,
      })
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

    // Settings icon:
    let sWidth = height * 1.5
    let sHeight = height * 1.5
    let sLeft = windowWidth * 0.95 - sWidth
    let sTop = windowHeight * 0.05

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
        // 设置
        {
          id: EVENT_TAP_SETTINGS,
          iconPath: '/resources/img/icon_home.png',
          position: {
            left: sLeft,
            top: sTop,
            width: sWidth,
            height: sHeight,
          },
          clickable: true,
        },
      ],
    })
  },
})
