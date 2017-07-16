import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'
import { requestVerifyCode, verifyCode } from '../../api/api'

import { verifyReg } from '../../utils/reg'

let bindPage
let timeoutCount

let countDown = () => {
    let countDownTime = bindPage.data.countDownTime
    if (countDownTime === 0) {
        bindPage.setData({
            counting: false,
            requestText: '重新获取',
            countDownTime: 60,
        })
        return
    } else {
        bindPage.setData({
            counting: true,
            requestText: countDownTime + ' 秒',
            countDownTime: countDownTime - 1,
        })
    }
    timeoutCount = setTimeout(countDown, 1000)
}

Page({
  data: {
      countDownTime: 60,
      counting: false,
      requestText: '获取验证码',
      mobile: '',
  },

  onLoad: function(options: any): void {
    bindPage = this
  },

  onUnload: () => {
      clearTimeout(timeoutCount)
  },

  onInputMobile: (e) => {
      bindPage.setData({
        mobile: e.detail.value,
      })
  },
  
  onRequestCode: (e) => {
      if (bindPage.data.counting) {
          return
      }

      let mobile = bindPage.data.mobile
      if (!verifyReg(mobile, 'mobile')) {
        showErrDialog('请输入正确的 11 位手机号')
        return
      }

      countDown()
      showLoading('正在获取验证码...')
      requestVerifyCode(mobile, (result: string) => {
          hideLoading()
          if (result === 'ok') {
              showDialog('验证码已发送，请注意查收')
          }
      }, () => {
          hideLoading()
      })
  },

  formSubmit: (e) => {
      let mobile = e.detail.value.mobile_input
      if (!verifyReg(mobile, 'mobile')) {
        showErrDialog('请输入正确的 11 位手机号')
        return
      }

      let code = e.detail.value.code_input
      if (!verifyReg(code, 'smscode')) {
        showErrDialog('请输入 6 位数字验证码')
        return
      }

      showLoading('正在验证')
      verifyCode(mobile, code, (result: string) => {
          hideLoading()
          if (result === 'ok') {
              showDialog('绑定成功~')
              showConfirmDialog('提示', '绑定成功~', (confirm: boolean) => {
                  wx.navigateBack({
                    delta: 1,
                  })
              }, false)
          }
      }, () => {
          hideLoading()
      })
  },
})
