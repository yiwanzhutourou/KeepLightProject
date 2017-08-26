import { deleteCardById, getCardById } from '../../api/api'
import { hideLoading, parseTimeToDate, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { CardDetail } from '../../api/interfaces'
import { deleteCardFromCache } from '../../utils/discoverCache'
import { setPostModifyData } from '../../utils/postCache'

let cardPage

const formatResult = (result: CardDetail) => {
    result.timeString = parseTimeToDate(result.createTime)
    return result
}

Page({
  data: {
      cardId: -1,
      cardDetail: null,
  },

  onLoad: function(option: any): void {
    cardPage = this

    if (!option || !option.id) {
        wx.navigateBack({
            delta: 1,
        })
    } else {
        cardPage.setData({
            cardId: option.id,
            showPostSuccess: option.showPostSuccess,
        })
    }
  },

  onShow: function (): void {
    let cardId = cardPage.data.cardId
    if (!cardId || cardId < 0) {
        return
    }
    showLoading('正在加载...')
    getCardById(cardId, (result: CardDetail) => {
        hideLoading()
        if (cardPage.data.showPostSuccess) {
            showDialog('发布成功')
        }
        cardPage.setData({
            cardDetail: formatResult(result),
        })
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('无法加载读书卡片，请检查你的网络状态')
        }
    })
  },

  onDelete: (e) => {
    let cardId = cardPage.data.cardDetail.id
    if (!cardId) {
        return
    }
    showConfirmDialog('', '确认删除？', (confirm: boolean) => {
        if (confirm) {
          showLoading('正在删除')
          deleteCardById(cardId, (result: string) => {
              deleteCardFromCache(cardId)
              hideLoading()
              wx.navigateBack({
                  delta: 1,
              })
          }, (failure) => {
              hideLoading()
              if (!failure.data) {
                  showErrDialog('无法删除，请检查你的网络')
              }
          })
        }
    })
  },

  onUserTap: (e) => {
      let user = e.currentTarget.dataset.user
      wx.navigateTo({
          url: '../homepage/homepage2?user=' + user,
      })
  },

  onModify: (e) => {
      let cardDetail = cardPage.data.cardDetail
      setPostModifyData(
                cardDetail.id,
                cardDetail.title, cardDetail.content,
                cardDetail.picUrl, cardDetail.book)
      wx.navigateTo({
          url: './post',
      })
  },

  onShareAppMessage: () => {
    let cardDetail = cardPage.data.cardDetail
    return {
      title: cardDetail && cardDetail.user.nickname ?
                cardDetail.user.nickname + '的读书卡片' : '有读书房读书卡片',
      path: 'pages/card/card?id=' + cardDetail.id,
    }
  },
})
