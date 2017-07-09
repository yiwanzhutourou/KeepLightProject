import { Markers, Result } from '../../api/interfaces'
import { getMarkers, getUserInfo } from '../../api/api'

let app = getApp()
let indexPage
let mapCtx

// 每一公里所跨越的经纬度
const KILOMETER_LAT = 0.0019
const KILOMETER_LNG = 0.0017

Page({
  data: {
    longitude: 121.438378,
    latitude: 31.181471,
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
            const mergedMarkers = indexPage.mergeMarkers(markers)
            const transformedMarkers = indexPage.transformMarkers(mergedMarkers)
            indexPage.setData({
              markers: transformedMarkers,
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

  onRegionChange: (e) => {
    console.log(e)
    mapCtx.getCenterLocation({
      success: (res) => {
        console.log(res)
      },
    })
  },

  onMapTap: (e) => {
    console.log(e)
  },

  onShareAppMessage: () => {
    return {
      title: '有读书房',
      path: 'pages/index/index',
    }
  },

  shouldMerge: (m1: Markers, m2: Markers) => {
    if (Math.abs(m1.latitude - m2.latitude) < KILOMETER_LAT &&
          Math.abs(m1.longitude - m2.longitude) < KILOMETER_LNG) {
      return true
    }
    return false
  },

  mergeMarkers: (markers: Array<Markers>) => {
    if (!markers) {
      return markers
    }
    const result: Array<Array<Markers>> = []
    markers.forEach((marker) => {
      if (result.length === 0) {
        result.push([marker])
      } else {
        let shouldAppend = true
        for (const markerArray of result) {
          if (indexPage.shouldMerge(markerArray[0], marker)) {
            markerArray.push(marker)
            shouldAppend = false
            break
          }
        }
        if (shouldAppend) {
          result.push([marker])
        }
      }
    })
    return result
  },

  transformMarkers: (markers: Array<Array<Markers>>) => {
    const result: Array<Markers> = []
    for (const markerArray of markers) {
      const m = markerArray[0]
      if (markerArray.length > 1) {
        m.isMergeMarker = true
        m.children = JSON.parse(JSON.stringify(markerArray))
        m.callout = {
          content: markerArray.length + '家书房',
          color: '#ff4466',
          borderRadius: 5,
          bgColor: '#ff0000',
          padding: 5
        }
      } else {
        m.callout = {
          content: m.title + '的书房',
          color: '#ff4466',
          borderRadius: 5,
          bgColor: '#ff0000',
          padding: 5
        }
      }
      result.push(m)
    }
    return result
  }
})
