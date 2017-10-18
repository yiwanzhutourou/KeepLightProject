import { hideLoading, showErrDialog, showLoading } from '../../utils/utils'

import { QRCode } from '../../api/interfaces'
import { getMyQRCode } from '../../api/api'

// dirty tricky =。=
declare var require: any

let QR = require('../../jsutils/qrcode.js')
let myqrcodePage

Page({
  data: {
    /*
    官网说hidden只是简单的控制显示与隐藏，组件始终会被渲染，
    但是将canvas转化成图片走的居然是fail，hidden为false就是成功的
    所以这里手动控制显示隐藏canvas
    */
    maskHidden: true,
    avater: '',
    nickname: '',
  },

  onLoad: function(options: any): void {
    myqrcodePage = this
    
    showLoading('正在加载')
    let size = myqrcodePage.setCanvasSize() // 动态设置画布大小
    getMyQRCode((qrCode: QRCode) => {
      if (qrCode) {
        myqrcodePage.setData({
          avatar: qrCode.avatar,
          nickname: qrCode.nickname,
        })
        myqrcodePage.createQrCode(qrCode.qrToken, 'mycanvas', size.w, size.h)
      }
      hideLoading()
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法加载数据，请检查你的网络')
      }
    })
  },

  // 适配不同屏幕大小的canvas
  setCanvasSize: () => {
    let size = {} as any
    try {
        let res = wx.getSystemInfoSync() as any
        let scale = 750 / 660 // 不同屏幕下canvas的适配比例；设计稿是750宽
        let width = res.windowWidth / scale
        let height = width // canvas画布为正方形
        size.w = width
        size.h = height
    } catch (e) {
        // ignore
    } 
    return size
  },

  createQrCode: (url, canvasId, cavW, cavH) => {
    // 调用插件中的draw方法，绘制二维码图片
    QR.qrApi.draw(url, canvasId, cavW, cavH)
  },
})
