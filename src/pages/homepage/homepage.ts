// pages/homepage/homepage.js
import { getUserIntro, setUserIntro } from '../../api/api'
import { showErrDialog, showToast } from '../../utils/utils'

let homepage: WeApp.Page

Page({
  data: {
    userInfo: {},
    isCurrentUser: true,
    userIntro: '',
    showIntro: false,
    introEditting: false,
    editUserIntroText: '编辑',
    userIntroToEdit: '',
  },
  onLoad: function(option: any): void {
    homepage = this
    // 调用应用实例的方法获取全局数据
    // TODO: 判断用户是否为当前登录用户（存什么到服务器用来比较用户唯一性？）
    let isCurrentUser = true

    getApp().getUserInfo((userInfo: any) => {
      // 更新数据
      homepage.setData({
        userInfo: userInfo,
      })
    })

    // 获取用户简介
    getUserIntro((success: boolean, errMsg: string, result: any) => {
      let showIntro = true
      let editUserIntroText = '编辑'
      let userIntroToEdit = ''
      if (success) {
        if (!result || result === '') {
          if (isCurrentUser) {
            result = '您还没有介绍您的书房'
            editUserIntroText = '添加简介'
          } else {
            showIntro = false
          }
        } else {
          userIntroToEdit = result
        }
        homepage.setData({
          userIntro: result,
          showIntro: showIntro,
          editUserIntroText: editUserIntroText,
          userIntroToEdit: userIntroToEdit,
        })
      } else {
        showErrDialog(errMsg)
      }
    })
  },

  chooseLocation: () => {
    wx.chooseLocation({
      success: (res: WeApp.ChoosedLoaction) => {
        // success
        homepage.setData({
          addressName: res.name,
        })
        showToast('添加成功')
      },
    })
  },

  onAddBookTap: () => {
    wx.navigateTo({
      url: '../book/addBook',
    })
  },

  onEditUserIntroTap: () => {
    homepage.setData({
      introEditting: true,
    })
  },

  onEditIntroDone: (e) => {
    console.log(e.detail.value.textarea)
    let intro
    if (e.detail.value.textarea && typeof e.detail.value.textarea === 'string') {
      intro = e.detail.value.textarea
    } else if (e.detail.value && typeof e.detail.value === 'string') {
      intro = e.detail.value
    }
    setUserIntro(intro, (success: boolean, errMsg: string, result: any) => {
      if (success) {
        showToast('更新成功')
        homepage.setData({
          userIntro: result,
          introEditting: false,
          editUserIntroText: '编辑',
          userIntroToEdit: result,
        })
      } else {
        showErrDialog(errMsg)
      }
    })
  },

  onEditIntroCancel: () => {
    homepage.setData({
      introEditting: false,
    })
  },
})
