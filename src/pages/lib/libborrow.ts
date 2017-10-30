import { hideLoading, showErrDialog, showLoading } from '../../utils/utils'

import { Book } from '../../api/interfaces'
import { getBookInfo } from '../../api/api'
import { getLibBorrowUser } from '../../utils/shareData'

let libborrowPage

Page({
  data: {
    libId: '',
    user: [],
    bookList: [],
  },

  onLoad: function(options: any): void {
    libborrowPage = this

    if (!options || !options.id) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }

    let user = getLibBorrowUser()
    if (!user) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }

    libborrowPage.setData({
      libId: options.id,
      user: user,
    })    
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onScanTap: (e) => {
    wx.scanCode({
      success: (res: WeApp.ScanCodeResult) => {
        if (!res) {
          showErrDialog('请扫描正确图书背面的 ISBN 码')
          return
        }
        if (res.scanType === 'EAN_13' && res.result) {
          // 图书页
          // 从豆瓣获取图书信息
          showLoading('正在查找图书信息')
          getBookInfo(res.result, (books: Array<Book>) => {
              hideLoading()
              if (books && books.length > 0 && books[0]) {
                let bookList = libborrowPage.data.bookList
                bookList.push(books[0])
                libborrowPage.setData({
                  bookList: bookList,
                })
              } else {
                showErrDialog('无法获取图书信息')
              }
            }, (failure) => {
              hideLoading()
              if (!failure.data) {
                showErrDialog('无法获取数据，请检查你的网络')
              }
          })
        } else {
          showErrDialog('请扫描正确图书背面的 ISBN 码')
        }
      },
    })
  },
})
