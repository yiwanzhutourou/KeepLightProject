import { Markers, Result } from '../../api/interfaces'
import { getMarkers, getUserInfo, getUserToken } from '../../api/api'

let app = getApp()
let indexPage
let mapCtx

Page({
  data: {
    longitude: 0,
    latitude: 0,
    markers: [],
  },

  onLoad: function(): void {
    indexPage = this

    // 使用 wx.createMapContext 获取 map 上下文 
    mapCtx = wx.createMapContext('homeMap')
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

  markertap: (event) => {
    if (event && event.markerId) {
      wx.navigateTo({
          url: '../homepage/homepage2?user=' + event.markerId,
      })
    }
  },
})
