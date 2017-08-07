import { getFollowers, getFollowings } from '../../api/api'
import { hideLoading, showDialog, showLoading } from '../../utils/utils'

import { SearchUser } from '../../api/interfaces'
import { getAddressDisplayText } from '../../utils/addrUtils'

let followPage

const IS_FOLLOWINGS = 0
const IS_FOLLOWERS = 1

let formatList = (list: Array<SearchUser>) => {
    list.forEach((item: SearchUser) => {
        item.addressText = getAddressDisplayText(item.address as any)
    })
    return list
}

Page({
  data: {
    type: IS_FOLLOWINGS,
    followList: [],
    emptyText: '没有关注的书房',
    showList: false,
    showEmpty: false,
    showNetworkError: false,
  },

  onLoad: function(options: any): void {
    followPage = this
    if (options && options.content) {
        if (options.content === 'followings') {
            wx.setNavigationBarTitle({
              title: '我关注的人',
            })
            followPage.setData({
              type: IS_FOLLOWINGS,
              emptyText: '没有关注的人',
            })
        } else {
            wx.setNavigationBarTitle({
              title: '关注我的人',
            })
            followPage.setData({
              type: IS_FOLLOWERS,
              emptyText: '暂时没有关注我的人',
            })
        }
    }
  },

  onShow: function (): void {
    followPage.loadData()
  },

  loadData: () => {
    let type = followPage.data.type
    if (type === IS_FOLLOWINGS) {
      showLoading('正在加载')
      getFollowings((list: Array<SearchUser>) => {
        hideLoading()
        followPage.setData({
          followList: formatList(list),
          showList: list.length > 0,
          showEmpty: list.length == 0,
        })
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
          followPage.setData({
            showNetworkError: true,
          })
        }
      })
    } else {
      showLoading('正在加载')
      getFollowers((list: Array<SearchUser>) => {
        hideLoading()
        followPage.setData({
          followList: formatList(list),
          showList: list.length > 0,
          showEmpty: list.length == 0,
        })
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
          followPage.setData({
            showNetworkError: true,
          })
        }
      })
    }
  },

  onUserItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },

  onReload: (e) => {
    followPage.loadData()
  },
})
