import { getMinePageData, getUserToken, login } from '../../api/api'
import { getMinePageCache, updateMinePageCache } from '../../utils/urlCache'

import { MinePageData } from '../../api/interfaces'
import { setPostBookData } from '../../utils/postCache';

const SETTING_MY_BOOKS = 0
const SETTING_BORROW_REQUEST_IN = 1
const SETTING_BORROW_REQUEST_OUT = 2
const SETTING_BORROW_IN = 3
const SETTING_BORROW_OUT = 4
const SETTING_SETTINGS = 5
const SETTING_ABOUT = 6

const SETTING_MY_ORDER_BOOK = 7
const SETTING_OUT_ORDER_BOOK = 8

let minePage

Page({
    data: {
        isLogin: false,
        user: null,
        mineItems: [
            {
                id: SETTING_MY_BOOKS,
                title: '书',
                icon: '../../resources/img/icon_book.png',
            },
            {
                id: SETTING_MY_ORDER_BOOK,
                title: '借阅历史',
                icon: '../../resources/img/icon_request.png',
            },
            {
                id: SETTING_OUT_ORDER_BOOK,
                title: '借阅请求',
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

    onLoad: function(): void {
        minePage = this
    },

    onShow: function(): void {
        minePage.loadData()
    },

    loadData: () => {
        let isLogin = !!getUserToken()
        minePage.setData({
            isLogin: isLogin,
        })
        if (isLogin) {
            // 先从cache里读
            let minePageCache = getMinePageCache()
            if (minePageCache) {
                minePage.updateData(minePageCache)
            }

            getMinePageData((result: MinePageData) => {
                minePage.updateData(result)
                updateMinePageCache(result)
            })
        }
    },

    updateData: (data: MinePageData) => {
        let mines = minePage.data.mineItems
        mines.forEach((item) => {
            if (item.id === SETTING_MY_BOOKS) {
                item.subInfo = data.bookCount + ' 本'
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

    onShowMyRoom: () => {
        wx.navigateTo({
            url: '../homepage/homepage',
        })
    },

    onShowMyQRCode: () => {
        wx.navigateTo({
            url: '../borrow/myqrcode',
        })
    },

    onFollowingTap: () => {
        wx.navigateTo({
            url: './follow?content=followings',
        })
    },

    onFollowerTap: () => {
        wx.navigateTo({
            url: './follow?content=followers',
        })
    },

    bindUserInfo: (userInfo: any) => {
        if (userInfo && userInfo.detail && userInfo.detail.userInfo) {
            login(userInfo.detail.userInfo, () => {
                minePage.loadData()
            })
        }
    },
})
