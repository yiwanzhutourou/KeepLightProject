// pages/homepage/homepage.js
import { getBookList, getUserIntro, setUserIntro } from '../../api/api'
import { showErrDialog, showToast } from '../../utils/utils'

import { Result } from '../../api/interfaces'

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
    bookList: [],
    isHomePage: true,
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
    getUserIntro((result: Result) => {
      let intro = ''
      let showIntro = true
      let editUserIntroText = '编辑'
      let userIntroToEdit = ''
      if (result && result.success) {
        if (!result.data || result.data === '') {
          if (isCurrentUser) {
            intro = '您还没有介绍您的书房'
            editUserIntroText = '添加简介'
          } else {
            showIntro = false
          }
        } else {
          intro = result.data
          userIntroToEdit = result.data
        }
        homepage.setData({
          userIntro: intro,
          showIntro: showIntro,
          editUserIntroText: editUserIntroText,
          userIntroToEdit: userIntroToEdit,
        })
      } else {
        showErrDialog(result.errMsg)
      }
    })
  },

  onShow: function (): void {
      getBookList((result: Result) => {
        if (result && result.success) {
          this.setData({
            bookList: result.data,
          })
        } else {
          showErrDialog('无法获取您的图书列表，请检查您的网络状态')
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
    let intro
    if (e.detail.value.textarea && typeof e.detail.value.textarea === 'string') {
      intro = e.detail.value.textarea
    } else if (e.detail.value && typeof e.detail.value === 'string') {
      intro = e.detail.value
    }
    setUserIntro(intro, (result: Result) => {
      if (result.success) {
        showToast('更新成功')
        homepage.setData({
          userIntro: result.data,
          introEditting: false,
          editUserIntroText: '编辑',
          userIntroToEdit: result.data,
        })
      } else {
        showErrDialog(result.errMsg)
      }
    })
  },

  onEditIntroCancel: () => {
    homepage.setData({
      introEditting: false,
    })
  },

  onBookItemTap: (e) => {
    // TODO: 微信小程序不支持WebView，需要一个图书详情页吗？
  },
})
