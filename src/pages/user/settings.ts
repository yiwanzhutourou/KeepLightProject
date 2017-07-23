import { getBorrowRequestCount, getUserContact } from '../../api/api'

import { UserContact } from '../../api/interfaces'

const SETTING_BIND_WEIXIN = 0
const SETTING_BIND_MOBILE = 1
const SETTING_ADDRESS = 2
const SETTING_CHANGE_INFO = 3
const SETTING_BORROW_HISTORY = 4
const SETTING_ABOUT = 5

let settingsPage

Page({
  data: {
    settingItems: [
        {
            id: SETTING_BIND_WEIXIN,
            title: '设置联系方式',
            subTitle: '设置微信号、QQ或者邮箱方便书友联系你',
        },
        {
            id: SETTING_BIND_MOBILE,
            title: '修改绑定的手机号',
            subTitle: '有读书房获取你的手机号只用于向你发送借阅相关的通知',
        },
        {
            id: SETTING_ADDRESS,
            title: '管理书房位置',
            subTitle: '添加书房位置方便书友在地图上找到你的书房',
        },
        {
            id: SETTING_CHANGE_INFO,
            title: '修改书房简介',
            subTitle: '给你的书房添加简短的介绍吧',
        },
        {
            id: SETTING_BORROW_HISTORY,
            title: '借阅历史',
        },
        {
            id: SETTING_ABOUT,
            title: '关于有读书房',
        },
    ],
  },

  onLoad: function(options: any): void {
    settingsPage = this
  },

  onShow: function(): void {
    getUserContact((result: UserContact) => {
        let settings = new Array()
        settingsPage.data.settingItems.forEach((item) => {
            if (item.id === SETTING_BIND_WEIXIN) {
                settings.push(
                    {
                        id: SETTING_BIND_WEIXIN,
                        title: '设置联系方式',
                        subTitle: '设置微信号、QQ或者邮箱方便书友联系你',
                        subInfo: result.name ? '已设置' + result.name : '',
                    },
                )
            } else {
                settings.push(item)
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
          case SETTING_BIND_WEIXIN:
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
          case SETTING_BORROW_HISTORY:
            wx.navigateTo({
                url: '../user/history',
            })
            break
          case SETTING_ABOUT:
            wx.navigateTo({
                url: '../about/about',
            })
            break
          default:
      }
  },
})
