// app.js
export type GlobalData = {
  locationInfo?: WeApp.LocationInfo,
  systemInfo?: WeApp.SystemInfo,
}

const globalData: GlobalData = {}

App({
  onLaunch: (info: WeApp.LaunchData) => {
    // Do nothing
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
