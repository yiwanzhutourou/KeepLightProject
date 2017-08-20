import { hideLoading, parseTimeToDate } from '../../utils/utils'

import { MyCardItem } from '../../api/interfaces'
import { getCardListByUser } from '../../api/api'

let usercardsPage

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
    userId: 0,
    cardList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(option: any): void {
    usercardsPage = this
    if (!option || !option.user) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }
    usercardsPage.setData({
        userId: option.user,
    })
  },

  onShow: function (): void {
    usercardsPage.loadData()
  },

  loadData: () => {
    getCardListByUser(usercardsPage.data.userId, (cards: Array<MyCardItem>) => {
      hideLoading()
      usercardsPage.setData({
        cardList: formatList(cards),
        showEmpty: cards.length == 0,
        showList: cards.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        usercardsPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    usercardsPage.loadData()
  },

  onCardItemTap: (e) => {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
        url: './card?id=' + id,
    })
  },
})
