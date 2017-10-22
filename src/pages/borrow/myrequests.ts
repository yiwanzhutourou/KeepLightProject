import { hideLoading, showLoading, timestamp2TextComplex } from '../../utils/utils'

import { BorrowRequestNew } from '../../api/interfaces'
import { getMyBorrowRequests } from '../../api/api'
import { parseAuthor } from '../../utils/bookUtils'

let myrequestsPage

const parseDataList = (data: Array<BorrowRequestNew>) => {
  if (data && data.length > 0) {
    data.forEach((request: BorrowRequestNew) => {
       if (request.book && request.book.author) {
         request.book.authorString = parseAuthor(request.book.author, ' ')
       }
       request.timeString = timestamp2TextComplex(request.timestamp)
    })
  }
  return data
}

Page({
  data: {
    showFlag: 0,
    dataList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(option: any): void {
    myrequestsPage = this
  },

  onShow: function (): void {
    myrequestsPage.loadData()
  },

  onShowFlag: (e) => {
    let oldShowFlag = parseInt(myrequestsPage.data.showFlag, 10)
    let newShowFlag = parseInt(e.currentTarget.dataset.flag, 10)
    if (oldShowFlag === newShowFlag) {
      return
    }
    myrequestsPage.setData({
      showFlag: newShowFlag,
    })
    myrequestsPage.loadData()
  },

  loadData: () => {
    myrequestsPage.setData({
      dataList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
    })
    showLoading('正在加载...')
    let flag = myrequestsPage.data.showFlag
    getMyBorrowRequests(flag, (data: Array<BorrowRequestNew>) => {
      hideLoading()
      myrequestsPage.setData({
        dataList: parseDataList(data),
        showEmpty: data.length == 0,
        showList: data.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myrequestsPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    myrequestsPage.loadData()
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },
})
