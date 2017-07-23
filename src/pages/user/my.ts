import { getBorrowRequestCount } from '../../api/api'

const SETTING_BORROW_REQUEST = 3
const SETTING_BORROW_HISTORY = 4

let myPage

Page({
  data: {
    myItems: [
        {
            id: SETTING_BORROW_REQUEST,
            title: '处理借阅请求',
            subTitle: '点击查看你的所有借阅请求',
        },
        {
            id: SETTING_BORROW_HISTORY,
            title: '我的消息',
            subTitle: '如果其他书友同意了你的借阅请求，可以在这里查看联系方式',
        },
    ],
  },

  onLoad: function(options: any): void {
    myPage = this
  },

  onShow: function(): void {
    getBorrowRequestCount((count: number) => {
        let countText = ''
        if (count > 0 && count < 100) {
            countText = '' + count
        } else if (count >= 100) {
            countText = '99+'
        }
        let mys = new Array()
        myPage.data.myItems.forEach((item) => {
            if (item.id === SETTING_BORROW_REQUEST) {
                mys.push(
                    {
                        id: SETTING_BORROW_REQUEST,
                        title: '处理借阅请求',
                        subTitle: '点击查看你的所有借阅请求',
                        unreadCount: countText,
                    },
                )
            } else {
                mys.push(item)
            }
        })
        myPage.setData({
            myItems: mys,
        })
    })
  },

  onSettingItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      switch (id) {
          case SETTING_BORROW_REQUEST:
            wx.navigateTo({
                url: '../user/request',
            })
            break
          case SETTING_BORROW_HISTORY:
            wx.navigateTo({
                url: '../message/approved',
            })
            break
          default:
      }
  },
})
