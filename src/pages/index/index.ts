import { Markers, Result } from '../../api/interfaces'
import { getMarkers, getUserInfo } from '../../api/api'

import { rpx2px } from '../../utils/utils'
import { shouldShowLanding } from '../../utils/urlCache'

const EVENT_TAP_SEARCH = 0
const EVENT_TAP_SHOW_CURRENT_LOCATION = 1

// 如果算出来的离我最近的点，十分的近的话，就会把地图的缩放level提到最高，体验不好
// 所以如果离我最近的点的距离小于这个的话，就不对地图进行缩放了
const MIN_DISTANCE_FLOOR = 0.002

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
    includePoints: [],
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
    let showLanding = shouldShowLanding()
    if (showLanding) {
      wx.navigateTo({
        url: '../index/landing',
      })
    } else {
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
              console.log(markers.length, transformedMarkers.length)
              indexPage.setData({
                markers: transformedMarkers,
                includePoints: indexPage.composeIncludePoints(transformedMarkers),
              })
            },
          ) 
      })
    }
  },

  controltap: (event) => {
    switch (event.controlId) {
      // case EVENT_TAP_SEARCH:
      //   wx.navigateTo({
      //     url: '../search/search',
      //   })
      //   break
      case EVENT_TAP_SHOW_CURRENT_LOCATION:
        mapCtx.moveToLocation()
        break
      default:
    }
  },

  markertap: (event) => {
    if (event && event.markerId) {
      const marker = indexPage.findMarker(event.markerId) as Markers
      if (marker.isMergeMarker) {
        wx.navigateTo({
          url: 'mapdetail?users=' + marker.children
        })
      } else {
        wx.navigateTo({
            url: '../homepage/homepage2?user=' + event.markerId,
        })
      }
    }
  },

  findMarker: (id: string) => {
    if (indexPage.data.markers) {
      return indexPage.data.markers.find((marker) => (marker.id + '') === id)
    }
    return { markerId: id }
  },

  onRegionChange: (e) => {
    // 地图拖动的时候，把包含点设置为空
    indexPage.setData({
      includePoints: []
    })
    mapCtx.getCenterLocation({
      success: (res) => {
      },
    })
  },

  onMapTap: (e) => {
  },

  onShareAppMessage: () => {
    return {
      title: '有读书房',
      path: 'pages/index/index',
    }
  },

  setUpIconOnmap: () => {
    // // Homepage icon:
    // let width = windowWidth * 0.15
    // let height = width
    // let left = windowWidth * 0.95 - width
    // let top = windowHeight * 0.05

    // Show current location icon:
    let cWidth = windowWidth * 0.1
    let cHeight = cWidth
    let cLeft = windowWidth * 0.97 - cWidth
    let cTop = windowHeight * 0.92 - cHeight

    indexPage.setData({
      controls: [
        // 搜索按钮
        // {
        //   id: EVENT_TAP_SEARCH,
        //   iconPath: '/resources/img/icon_search.png',
        //   position: {
        //     left: left,
        //     top: top,
        //     width: width,
        //     height: height,
        //   },
        //   clickable: true,
        // },
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

  onSearchTap: (e) => {
    wx.navigateTo({
      url: '../search/search',
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
      if (markerArray.length > 1) {
        m.isMergeMarker = true
        m.children = markerArray.reduce((prev, cur, index) => {
          if (index === 0) {
            return cur.id + ''
          }
          return prev + ',' + cur.id
        }, '')
        m.iconPath = indexPage.getMapIcon(markerArray.length)
      }
      result.push(m)
    }
    return result
  },

  getMapIcon: (num: number) => {
    switch (num) {
      case 2:
        return '/resources/img/icon_two.png'
      case 3:
        return '/resources/img/icon_three.png'
      default:
        return '/resources/img/icon_four.png'
    }
  },

  composeIncludePoints: (markers: Array<Markers>) => {
    // 如果内存中有缓存了，就不再设置包含点了，不然会有多余的缩放
    if (indexPage.data.markers.length !== 0) {
      return []
    }
    let minDist = 99999999
    let result
    const myLat = indexPage.data.latitude
    const myLon = indexPage.data.longitude

    // 找出最近的点
    markers.forEach((marker) => {
      const latOff = Math.abs(myLat - marker.latitude)
      const lonOff = Math.abs(myLon - marker.longitude)
      const dist = latOff * latOff + lonOff * lonOff
      if (dist < minDist) {
        minDist = dist
        result = {
          latitude: parseFloat(marker.latitude.toString()),
          longitude: parseFloat(marker.longitude.toString())
        }
      }
    })

    console.log(minDist)
    if (minDist < MIN_DISTANCE_FLOOR) {
      return []
    }
    
    // 范围再扩大一些
    result.latitude = result.latitude + (result.latitude - myLat) * 0.5
    result.longitude = result.longitude + (result.longitude - myLon) * 0.5

    // 做一个镜像点，使得我的位置能够居中
    const mirrorPoint = {
      latitude: myLat + (myLat - result.latitude),
      longitude: myLon + (myLon - result.longitude)
    }
    const myPoint = {
      latitude: myLat,
      longitude: myLon
    }

    // 三个点都要显示在地图上，就可以了
    return [myPoint, mirrorPoint, result]
  },
})
