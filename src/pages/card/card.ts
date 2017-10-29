import { ApprovalResult, CardDetail } from '../../api/interfaces'
import { approveCard, approveCardById, declineCardById, deleteCardById, getCardById, unapproveCard } from '../../api/api'
import { hideLoading, parseTimeToDate, showConfirmDialog, showDialog, showErrDialog, showLoading, showToast } from '../../utils/utils'
import { needRefreshCard, updateNeedRefreshCard } from '../../utils/shareData'

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
      fromAdmin: false,
      fromList: true,
      approvalInProgress: false,
      showApprovalUser: false,
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
            fromList: option.fromList ? true : false,
            showPostSuccess: option.showPostSuccess,
        })
        if (option.admin) {
            cardPage.setData({
                fromAdmin: true,
            })
        }
        cardPage.loadData()
    }
  },

  onShow: function (): void {
      if (needRefreshCard()) {
          updateNeedRefreshCard(false)
          cardPage.setData({
              showPostSuccess: false,
          })
          cardPage.loadData()
      }
  },

  loadData: () => {
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

  onApproveCard: (e) => {
    let cardId = cardPage.data.cardDetail.id
    if (!cardId) {
        return
    }
    showLoading('正在操作...')
    approveCardById(cardId, () => {
        hideLoading()
        showToast('操作成功')
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('操作失败，请检查你的网络')
        }
    })
  },

  onDeclineCard: (e) => {
    let cardId = cardPage.data.cardDetail.id
    if (!cardId) {
        return
    }
    showLoading('正在操作...')
    declineCardById(cardId, () => {
        hideLoading()
        showToast('操作成功')
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('操作失败，请检查你的网络')
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

  onApprovalChange: (e) => {
      if (cardPage.data.approvalInProgress) {
          return
      }
      cardPage.setData({
          approvalInProgress: true,
      })
      let cardDetail = cardPage.data.cardDetail
      if (cardDetail.hasApproved) {
          unapproveCard(cardDetail.id, (result: ApprovalResult) => {
              hideLoading()
              showDialog('点赞已取消')
              cardDetail.hasApproved = false
              cardDetail.approvalCount = cardDetail.approvalCount - 1
              if (cardDetail.approvalList && cardDetail.approvalList.length > 0) {
                  for (let i = cardDetail.approvalList.length - 1; i >= 0; i--) {
                      if (cardDetail.approvalList[i].id === result.id) {
                          cardDetail.approvalList.splice(i, 1)
                          break
                      }
                  }
              }
              cardPage.setData({
                  cardDetail: cardDetail,
                  approvalInProgress: false,
                  showApprovalUser: false,
              })
          }, (failure) => {
              hideLoading()
              cardPage.setData({
                  approvalInProgress: false,
              })
              if (!failure.data) {
                  showErrDialog('无法加载数据，请检查你的网络')
              }
          })
      } else {
        approveCard(cardDetail.id, (result: ApprovalResult) => {
            hideLoading()
            showDialog('点赞成功')
            cardDetail.hasApproved = true
            cardDetail.approvalCount = cardDetail.approvalCount + 1
            if (!cardDetail.approvalList) {
                cardDetail.approvalList = new Array()
            }
            cardDetail.approvalList.unshift({
                id: result.id,
                avatar: result.avatar,
            })
            cardPage.setData({
                cardDetail: cardDetail,
                approvalInProgress: false,
            })
        }, (failure) => {
            hideLoading()
            cardPage.setData({
                approvalInProgress: false,
            })
            if (!failure.data) {
                showErrDialog('无法加载数据，请检查你的网络')
            }
        })
      }
  },

  onShowApprovalUser: (e) => {
      cardPage.setData({
          showApprovalUser: true,
      })
  },

  onHideApprovalUser: (e) => {
      cardPage.setData({
          showApprovalUser: false,
      })
  },

  onBookTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    if (isbn) {
        wx.navigateTo({
            url: '../book/book?isbn=' + isbn,
        })
    }
  },

  onShareAppMessage: () => {
    let cardDetail = cardPage.data.cardDetail
    return {
      title: cardDetail && cardDetail.user.nickname ?
                cardDetail.user.nickname + '的读书卡片' : '有读书房读书卡片',
      path: 'pages/card/card?id=' + cardDetail.id + '&fromList=1',
    }
  },
})
