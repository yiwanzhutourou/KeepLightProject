import { UserContact } from '../../api/interfaces'
import { getUserContact } from '../../api/api'
const SETTING_BIND_WEIXIN = 0
const SETTING_ADDRESS = 1
const SETTING_CHANGE_INFO = 2
const SETTING_BORROW_REQUEST = 3
const SETTING_BORROW_HISTORY = 4
const SETTING_ABOUT = 5

let settingsPage

Page({
  data: {
    settingItems: [
        {
            id: SETTING_BIND_WEIXIN,
            title: '设置联系方式',
            subTitle: '设置微信号、QQ或者邮箱方便书友联系您',
        },
        {
            id: SETTING_ADDRESS,
            title: '管理书房位置',
            subTitle: '添加书房位置方便书友在地图上找到您的书房',
        },
        {
            id: SETTING_CHANGE_INFO,
            title: '修改书房简介',
            subTitle: '给您的书房添加简短的介绍吧',
        },
        {
            id: SETTING_BORROW_REQUEST,
            title: '处理借阅请求',
            subTitle: '点击查看您的所有借阅请求',
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
        settingsPage.setData({
            settingItems: [
                {
                    id: SETTING_BIND_WEIXIN,
                    title: '设置联系方式',
                    subTitle: '设置微信号、QQ或者邮箱方便书友联系您',
                    subInfo: result.name ? '已设置' + result.name : '',
                },
                {
                    id: SETTING_ADDRESS,
                    title: '管理书房位置',
                    subTitle: '添加书房位置方便书友在地图上找到您的书房',
                },
                {
                    id: SETTING_CHANGE_INFO,
                    title: '修改书房简介',
                    subTitle: '给您的书房添加简短的介绍吧',
                },
                {
                    id: SETTING_BORROW_REQUEST,
                    title: '处理借阅请求',
                    subTitle: '点击查看您的所有借阅请求',
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
          case SETTING_BORROW_REQUEST:
            wx.navigateTo({
                url: '../user/request',
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
