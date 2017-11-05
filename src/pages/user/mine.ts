import { getBorrowRequestCount, getMinePageData, getUserInfo } from '../../api/api'
import { getMinePageCache, updateMinePageCache } from '../../utils/urlCache'

import { MinePageData } from '../../api/interfaces'

const SETTING_MY_BOOKS = 0
const SETTING_MY_CARDS = 1
const SETTING_BORROW_REQUEST_IN = 2
const SETTING_BORROW_REQUEST_OUT = 3
const SETTING_BORROW_IN = 4
const SETTING_BORROW_OUT = 5
const SETTING_SETTINGS = 6
const SETTING_ABOUT = 7

const SETTING_MY_ORDER_BOOK = 8
const SETTING_OUT_ORDER_BOOK = 9

let minePage
let lastLogoTap = -1
let logoTapCount = 0

Page({
  data: {
    user: null,
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
        // {
        //     id: SETTING_BORROW_REQUEST_IN,
        //     title: '收到的借阅请求',
        //     icon: '../../resources/img/icon_request.png',
        // },
        // {
        //     id: SETTING_BORROW_REQUEST_OUT,
        //     title: '发出的借阅请求',
        //     icon: '../../resources/img/icon_request_out.png',
        // },
        // {
        //     id: SETTING_BORROW_OUT,
        //     title: '借出的书',
        //     icon: '../../resources/img/icon_borrow_out.png',
        // },
        // {
        //     id: SETTING_BORROW_IN,
        //     title: '借入的书',
        //     icon: '../../resources/img/icon_return_book.png',
        // },
        {
            id: SETTING_MY_ORDER_BOOK,
            title: '预约历史',
            icon: '../../resources/img/icon_request.png',
        },
        {
            id: SETTING_OUT_ORDER_BOOK,
            title: '预约请求',
            icon: '../../resources/img/icon_request_out.png',
        },
        {
            id: SETTING_SETTINGS,
            title: '设置',
            icon: '../../resources/img/icon_setting.png',
        },
        {
            id: SETTING_ABOUT,
            title: '关于有读书房',
            icon: '../../resources/img/icon_setting_logo.png',
        },
    ],
    followingNumber: 0,
    followerNumber: 0,
  },

  onLoad: function(options: any): void {
      minePage = this
  },

  onShow: function(): void {
      // 先从cache里读
      let minePageCache = getMinePageCache()
      if (minePageCache) {
          minePage.updateData(minePageCache)
      }

      getMinePageData((result: MinePageData) => {
          minePage.updateData(result)
          updateMinePageCache(result)
    })
  },

  updateData: (data: MinePageData) => {
    let mines = minePage.data.mineItems
    mines.forEach((item) => {
        if (item.id === SETTING_MY_BOOKS) {
            item.subInfo = data.bookCount + ' 本'
        } else if (item.id === SETTING_MY_CARDS) {
            item.subInfo = data.cardCount + ' 个'
        }
    })
    minePage.setData({
        user: {
            nickname: data.nickname,
            avatar: data.avatar,
        },
        mineItems: mines,
        followingNumber: data.followingCount,
        followerNumber: data.followerCount,
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
            wx.navigateTo({
                url: '../card/mycards',
            })
            break
          case SETTING_BORROW_REQUEST_IN:
            wx.navigateTo({
                url: '../borrow/myrequests',
            })
            break
        case SETTING_BORROW_REQUEST_OUT:
            wx.navigateTo({
                url: '../borrow/myoutrequests',
            })
            break
        case SETTING_BORROW_OUT:
            wx.navigateTo({
                url: '../borrow/myoutbooks',
            })
            break
        case SETTING_BORROW_IN:
            wx.navigateTo({
                url: '../borrow/myborrowedbooks',
            })
            break
        case SETTING_SETTINGS:
            wx.navigateTo({
                url: './settings',
            })
            break
        case SETTING_ABOUT:
            wx.navigateTo({
                url: '../about/about',
            })
            break
        case SETTING_MY_ORDER_BOOK:
            wx.navigateTo({
                url: '../order/myorderedbooks?out=0',
            })
            break
        case SETTING_OUT_ORDER_BOOK:
            wx.navigateTo({
                url: '../order/myorderedbooks?in=1',
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

  onShowMyQRCode: (e) => {
      wx.navigateTo({
        url: '../borrow/myqrcode',
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

  onTapTap: (e) => {
    if (lastLogoTap === -1 || (e.timeStamp && (e.timeStamp - lastLogoTap) < 500)) {
      logoTapCount++
    } else {
      logoTapCount = 1
    }
    if (logoTapCount === 5) {
      lastLogoTap = -1
      logoTapCount = 0
      wx.navigateTo({
        url: '../lib/mylibs',
      })
    } else {
      lastLogoTap = e.timeStamp
    }
  },
})
