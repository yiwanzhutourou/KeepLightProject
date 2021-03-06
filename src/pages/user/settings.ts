import { CityInfo, SettingsData } from '../../api/interfaces'

import { getCityString } from '../../utils/addrUtils'
import { getSettingsData } from '../../api/api'

const SETTING_BIND_CONTACT = 0
const SETTING_BIND_MOBILE = 1
const SETTING_ADDRESS = 2
const SETTING_CHANGE_INFO = 3

let settingsPage

Page({
  data: {
    settingItems: [
        {
            id: SETTING_BIND_CONTACT,
            title: '设置联系方式',
            subTitle: '设置微信号、QQ或者邮箱方便书友联系你',
        },
        {
            id: SETTING_BIND_MOBILE,
            title: '修改绑定的手机号',
        },
        {
            id: SETTING_ADDRESS,
            title: '管理书房位置',
            subTitle: '添加的位置会显示在首页的地图上',
        },
        {
            id: SETTING_CHANGE_INFO,
            title: '修改书房简介',
            subTitle: '给你的书房添加简短的介绍吧',
        },
    ],
  },

  onLoad: function(options: any): void {
    settingsPage = this
  },

  onShow: function(): void {
    getSettingsData((result: SettingsData) => {
        let settings = settingsPage.data.settingItems
        settings.forEach((item) => {
            if (item.id === SETTING_BIND_CONTACT) {
                item.subInfo = (result.contact && result.contact.name)
                    ? '已设置' + result.contact.name : ''
            } else if (item.id === SETTING_BIND_MOBILE) {
                item.subInfo = '**** ' + result.mobileTail
            } else if (item.id === SETTING_ADDRESS) {
                if (result.address && result.address.length > 0) {
                    item.subInfo = getCityString(result.address[0])
                }
            }
        })
        settingsPage.setData({
            settingItems: settings,
        })
    })
  },

  onSettingItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      switch (id) {
          case SETTING_BIND_CONTACT:
            wx.navigateTo({
                url: '../user/contact',
            })
            break
          case SETTING_BIND_MOBILE:
            wx.navigateTo({
                url: '../user/bind',
            })
            break
          case SETTING_ADDRESS:
            wx.navigateTo({
                url: '../user/address',
            })
            break
          case SETTING_CHANGE_INFO:
            wx.navigateTo({
                url: '../user/changeintro',
            })
            break
          default:
      }
  },
})
