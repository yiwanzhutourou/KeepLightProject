import { getBorrowRequestCount, getMinePageData, getUserInfo } from '../../api/api'

import { MinePageData } from '../../api/interfaces'

const SETTING_MY_BOOKS = 0
const SETTING_MY_CARDS = 1
const SETTING_BORROW_HISTORY = 2
const SETTING_SETTINGS = 3

let minePage

Page({
  data: {
    userInfo: {},
    mineItems: [
        {
            id: SETTING_MY_BOOKS,
            title: '书',
            icon: '../../resources/img/icon_book.png',
        },
        {
            id: SETTING_MY_CARDS,
            title: '读书卡片',
            icon: '../../resources/img/icon_card.png',
        },
        {
            id: SETTING_BORROW_HISTORY,
            title: '借阅历史',
            icon: '../../resources/img/icon_history.png',
        },
        {
            id: SETTING_SETTINGS,
            title: '设置',
            icon: '../../resources/img/icon_setting.png',
        },
    ],
    followingNumber: 0,
    followerNumber: 0,
  },

  onLoad: function(options: any): void {
      minePage = this
      minePage.setData({
          userInfo: getUserInfo(),
      })
  },

  onShow: function(): void {
      getMinePageData((result: MinePageData) => {
        let mines = minePage.data.mineItems
        mines.forEach((item) => {
            if (item.id === SETTING_MY_BOOKS) {
                item.subInfo = result.bookCount + ' 本'
            } else if (item.id === SETTING_MY_CARDS) {
                item.subInfo = result.cardCount + ' 个'
            }
        })
        minePage.setData({
            mineItems: mines,
            followingNumber: result.followingCount,
            followerNumber: result.followerCount,
        })
    })
  },

  onSettingItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      switch (id) {
          case SETTING_MY_BOOKS:
            wx.navigateTo({
                url: './mybooks',
            })
            break
          case SETTING_MY_CARDS:
            break
          case SETTING_BORROW_HISTORY:
            wx.navigateTo({
                url: './history',
            })
            break
          case SETTING_SETTINGS:
            wx.navigateTo({
                url: './settings',
            })
            break
          default:
      }
  },

  onShowMyRoom: (e) => {
      wx.navigateTo({
        url: '../homepage/homepage',
      })
  },

  onFollowingTap: (e) => {
      wx.navigateTo({
        url: './follow?content=followings',
      })
  },

  onFollowerTap: (e) => {
      wx.navigateTo({
        url: './follow?content=followers',
      })
  },
})
