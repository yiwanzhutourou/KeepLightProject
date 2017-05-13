import { hideLoading, showDialog, showLoading } from '../../utils/utils'

import { getBookInfo } from '../../api/doubanapi'
import { parseBookInfo } from '../../utils/bookUtils'

// pages/book/addBook.js
let bookPage

Page({
  data: {
  },

  onLoad: function(options: any): void {
    // 页面初始化 options为页面跳转所带来的参数
    bookPage = this
  },

  scanISBN: () => {
    wx.scanCode({
      success: (res: WeApp.ScanCodeResult) => {
        // success
        bookPage.setData({
          code: res.result,
          codeType: res.scanType,
        })
        if (res.scanType !== 'EAN_13' || !res.result) {
            showDialog('无法获取图书ISBN')
        } else {
          // 从豆瓣获取图书信息
          showLoading('正在查找图书信息')
          getBookInfo(res.result,
            (success: boolean, errMsg: string, statusCode: number, data: any) => {
              hideLoading()
              if (success && statusCode === 200) {
                let bookInfo = parseBookInfo(data)
                bookPage.setData({
                  title: bookInfo.title,
                  author: bookInfo.author,
                  url: bookInfo.url,
                  imageSrc: bookInfo.cover,
                })
              } else {
                showDialog('无法获取图书信息')
              }
            },
          )
        }
      },
      fail: (res: any) => {
        showDialog('无法获取图书ISBN')
      },
    })
  },
})
