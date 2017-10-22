import { getMyBorrowRequests, markBookReturn } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading, timestamp2Text } from '../../utils/utils'

import { BorrowRequestNew } from '../../api/interfaces'

let myOutBooksPage

const parseDataList = (data: Array<BorrowRequestNew>) => {
  if (data && data.length > 0) {
    data.forEach((request: BorrowRequestNew) => {
       request.status = parseInt('' + request.status, 10)
       request.timeString = timestamp2Text(request.timestamp)
    })
  }
  return data
}

Page({
  data: {
    showFlag: 1,
    dataList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
    isOut: true,
  },
  
  onLoad: function(option: any): void {
    myOutBooksPage = this
    myOutBooksPage.loadData()
  },

  onShowFlag: (e) => {
    let oldShowFlag = parseInt(myOutBooksPage.data.showFlag, 10)
    let newShowFlag = parseInt(e.currentTarget.dataset.flag, 10)
    if (oldShowFlag === newShowFlag) {
      return
    }
    myOutBooksPage.setData({
      showFlag: newShowFlag,
    })
    myOutBooksPage.loadData()
  },

  loadData: () => {
    myOutBooksPage.setData({
      dataList: [],
      showNetworkError: false,
      showEmpty: false,
      showList: false,
    })
    showLoading('正在加载...')
    let flag = myOutBooksPage.data.showFlag
    getMyBorrowRequests(flag, (data: Array<BorrowRequestNew>) => {
      hideLoading()
      myOutBooksPage.setData({
        dataList: parseDataList(data),
        showEmpty: data.length == 0,
        showList: data.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        myOutBooksPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    myOutBooksPage.loadData()
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

  onUserTap: (e) => {
    let user = e.currentTarget.dataset.user
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + user,
    })
  },

  onMarkReturn: (e) => {
    let id = e.currentTarget.dataset.id
    let user = e.currentTarget.dataset.user
    let isbn = e.currentTarget.dataset.isbn
    if (id && user && isbn) {
      showConfirmDialog('', '标记图书为已还，意味着你已经收到了对方归还的图书。标记完成后，有读书房将认定图书已经归还。确认继续？', (confirm) => {        
        if (confirm) {
          showLoading('正在操作...')
          markBookReturn(id, user, isbn, () => {
            hideLoading()
            myOutBooksPage.removeItem(id)
          }, (failure) => {
            hideLoading()
            if (!failure.data) {
              showErrDialog('操作失败，请检查你的网络')
            }
          })
        }
      })
    }
  },

  removeItem: (id: string) => {
    let dataList = myOutBooksPage.data.dataList
    if (dataList) {
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i] && parseInt(dataList[i].id, 10) === parseInt(id, 10)) {
          dataList.splice(i, 1)
        }
      }
      myOutBooksPage.setData({
        dataList: dataList,
        showEmpty: dataList.length == 0,
        showList: dataList.length > 0,
      })
    }
  },
})
