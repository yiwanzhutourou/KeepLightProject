import { getUserIntro, setUserIntro } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

let introPage

Page({
  data: {
      showUi: false,
      intro: '',
  },

  onLoad: function(options: any): void {
    introPage = this

    showLoading('正在加载数据...')
    getUserIntro((result: string) => {
        hideLoading()
        introPage.setData({
            showUi: true,
            intro: result,
        })
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showConfirmDialog('提示', '无法获取数据，请检查你的网络状态', (confirm) => {
                if (confirm) {
                    wx.navigateBack({
                        delta: 1,
                    })
                }
            }, false)
        }
    })
  },

  formSubmit: (e) => {
      let introInput = e.detail.value.intro_input

      showLoading('正在更新你书房的简介')
      setUserIntro(introInput,
        () => {
            hideLoading()
            showDialog('更新成功')
            wx.navigateBack({
                delta: 1,
            })
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('更新失败，请检查你的网络状态')
            } 
        })
  },
})
