// app.js
export type GlobalData = {
  userInfo?: Object,
  locationInfo?: WeApp.LocationInfo,
  systemInfo?: WeApp.SystemInfo,
}

const globalData: GlobalData = {}

App({
  onLaunch: (info: WeApp.LaunchData) => {
    // Do nothing
  },
  // 用户信息
  getUserInfo: (cb: (res: Object) => void) => {
    if (globalData.userInfo) {
      cb(globalData.userInfo)
    } else {
      // 调用登录接口
      wx.login({
        success: () => {
          wx.getUserInfo({
            success: (res: WeApp.UserInfo) => {
              globalData.userInfo = res.userInfo
              cb(globalData.userInfo)
            },
          })
        },
      })
    }
  },
  // 定位信息
  getLocationInfo: (cb: (res: WeApp.LocationInfo) => void) => {
    if (globalData.locationInfo) {
        cb(globalData.locationInfo)
    } else {
        wx.getLocation({
          type: 'gcj02',
          success: (res: WeApp.LocationInfo) =>  {
            globalData.locationInfo = res
            cb(globalData.locationInfo)
          },
        })
    }
  },
  // 设备信息（屏幕宽高等）
  getSystemInfo: (cb: (res: WeApp.SystemInfo) => void) => {
    if (globalData.systemInfo) {
        cb(globalData.systemInfo)
    } else {
        wx.getSystemInfo({
          success: (res: WeApp.SystemInfo) => {
            globalData.systemInfo = res
            cb(globalData.systemInfo)
          },
        })
    }
  },
})
