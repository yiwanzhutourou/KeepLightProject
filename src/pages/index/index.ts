import { Markers, Result } from '../../api/interfaces'
import { getMarkers, getUserInfo } from '../../api/api'

const EVENT_TAP_SEARCH = 0
const EVENT_TAP_SHOW_CURRENT_LOCATION = 1

let app = getApp()
let indexPage
let mapCtx
let windowWidth
let windowHeight

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
            const mergedMarkers = indexPage.mergeMarkers(markers)
            const transformedMarkers = indexPage.transformMarkers(mergedMarkers)
            indexPage.setData({
              markers: transformedMarkers,
            })
          },
        ) 
    })
  },

  controltap: (event) => {
    switch (event.controlId) {
      case EVENT_TAP_SEARCH:
        wx.navigateTo({
          url: '../search/search',
        })
        break
      case EVENT_TAP_SHOW_CURRENT_LOCATION:
        mapCtx.moveToLocation()
        break
      default:
    }
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

  setUpIconOnmap: () => {
    // Homepage icon:
    let width = windowWidth * 0.15
    let height = width
    let left = windowWidth * 0.95 - width
    let top = windowHeight * 0.05

    // Show current location icon:
    let cWidth = windowWidth * 0.1
    let cHeight = cWidth
    let cLeft = windowWidth * 0.95 - cWidth
    let cTop = windowHeight * 0.95 - cHeight

    indexPage.setData({
      controls: [
        // 搜索按钮
        {
          id: EVENT_TAP_SEARCH,
          iconPath: '/resources/img/icon_search.png',
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
          iconPath: '/resources/img/icon_locate.png',
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
      m.callout = {
        content: m.title + '的书房',
        color: '#ff4466',
        borderRadius: 5,
        bgColor: '#ff0000',
        padding: 5
      }
      if (markerArray.length > 1) {
        m.isMergeMarker = true
        m.children = JSON.parse(JSON.stringify(markerArray))
<<<<<<< HEAD
        m.callout = {
          content: markerArray.length + '家书房',
          color: '#ffffff',
          borderRadius: 5,
          bgColor: '#ff4466',
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
=======
        m.callout.content = m.title + '的书房'
>>>>>>> reform
      }
      result.push(m)
    }
    return result
  }
})
