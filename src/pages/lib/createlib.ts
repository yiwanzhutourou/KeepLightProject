import { hideLoading, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { createLib } from '../../api/api'

let createlibPage

Page({

  onLoad: function(options: any): void {
    createlibPage = this
  },

  formSubmit: (e) => {
      let libName = e.detail.value.libname

      showLoading('正在创建')
      createLib(libName,
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
