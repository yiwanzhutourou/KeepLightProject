import { checkLibUser, getBookDetailsByIsbn, libAddBook } from '../../api/api'
import { hideLoading, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { User } from '../../api/interfaces'
import { setLibBorrowUser } from '../../utils/shareData'

const MAN_SCAN = 0
const MAN_ADD_BOOK = 1
const MAN_INFO_SETTING = 2
const MAN_SERVICE_SETTING = 3
const MAN_SHOW_BOOKS = 4
const MAN_SHOW_HOME = 5

let managelibPage

Page({
  data: {
    libId: '',
    settingItems: [
        {
            id: MAN_SCAN,
            title: '扫码',
        },
        {
            id: MAN_ADD_BOOK,
            title: '添加图书',
        },
        {
            id: MAN_INFO_SETTING,
            title: '图书馆信息修改',
            subTitle: '简介，图标等基本设置',
        },
        {
            id: MAN_SERVICE_SETTING,
            title: '图书馆后台设置',
            subTitle: '是否开启自助服务，默认还书期限等',
        },
        {
            id: MAN_SHOW_BOOKS,
            title: '查看图书',
        },
        {
            id: MAN_SHOW_HOME,
            title: '查看图书馆主页',
        },
    ],
  },

  onLoad: function(options: any): void {
    managelibPage = this

    if (!options || !options.id) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }
    managelibPage.setData({
        libId: options.id,
    })
  },

  onSettingItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      let libId = managelibPage.data.libId
      switch (id) {
          case MAN_SCAN:
            managelibPage.scanUser()
            break
          case MAN_ADD_BOOK:
            managelibPage.scanToAddBook()
            break
          case MAN_INFO_SETTING:
            wx.navigateTo({
                url: './libsetting?id=' + libId,
            })
            break
          case MAN_SERVICE_SETTING:
            break
          case MAN_SHOW_BOOKS:
            wx.navigateTo({
                url: './libbooks?id=' + libId,
            })
            break
          case MAN_SHOW_HOME:
            break
          default:
      }
  },

  scanUser: () => {
    wx.scanCode({
      success: (res: WeApp.ScanCodeResult) => {
        if (res && res.result) {
          let bochaUrl = 'bocha://youdushufang/'
          if (res.result.slice(0, bochaUrl.length) === bochaUrl) {
            let libId = managelibPage.data.libId
            let userId = res.result.slice(res.result.lastIndexOf('/') + 1)
            // 检查用户权限
            checkLibUser(libId, userId, (user: User) => {
              // 跳借阅界面
              setLibBorrowUser(user)
              wx.navigateTo({
                url: './libborrow?id=' + libId,
              })
            }, (failure) => {
              hideLoading()
              if (!failure.data) {
                showErrDialog('无法获取数据，请检查你的网络')
              }
          })
            return
          }
        }
        showErrDialog('请先扫描用户二维码')
      },
    })
  },

  scanToAddBook: () => {
    wx.scanCode({
        success: (res: WeApp.ScanCodeResult) => {
          if (!res) {
            showErrDialog('请扫描正确图书背面的 ISBN 码')
            return
          }
          if (res.scanType === 'EAN_13' && res.result) {
            // 图书页
            // 从豆瓣获取图书信息
            showLoading('正在添加')
            getBookDetailsByIsbn(res.result, (doubanBook: any) => {
              if (doubanBook) {
                let libId = managelibPage.data.libId
                libAddBook(libId, doubanBook, () => {
                    hideLoading()
                    showDialog('添加成功')
                  }, (failure) => {
                    hideLoading()
                    if (!failure.data) {
                      showErrDialog('无法获取数据，请检查你的网络')
                    }
                })
              } else {
                hideLoading()
                showErrDialog('无法获取图书信息，请稍后再试')
              }
            }, (failure) => {
              hideLoading()
              showErrDialog('网络错误，请稍后再试')
            })
          } else {
            showErrDialog('请扫描正确图书背面的 ISBN 码')
          }
        },
      })
  },
})
