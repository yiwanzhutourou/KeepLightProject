import { hideLoading, parseTimeToDate } from '../../utils/utils'

import { MyCardItem } from '../../api/interfaces'
import { getMyCards } from '../../api/api'

let mycardsPage

const formatList = (cards: Array<MyCardItem>) => {
   if (cards && cards.length > 0) {
     cards.forEach((card: MyCardItem) => {
        if (card.content) {
          card.content = card.content.replace(/\n/g, ' ')
        }
        card.timeString = parseTimeToDate(card.createTime)
     })
   }
   return cards
}

Page({
  data: {
    cardList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(option: any): void {
    mycardsPage = this
  },

  onShow: function (): void {
    mycardsPage.loadData()
  },

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    getMyCards((cards: Array<MyCardItem>) => {
      hideLoading()
      mycardsPage.setData({
        cardList: formatList(cards),
        showEmpty: cards.length == 0,
        showList: cards.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        mycardsPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    mycardsPage.loadData()
  },

  onPostNewCard: (e) => {
    wx.navigateTo({
      url: './post',
    })
  },

  onCardItemTap: (e) => {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
        url: './card?id=' + id,
    })
  },
})
