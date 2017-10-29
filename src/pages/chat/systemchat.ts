import { ChatData, Message } from '../../api/interfaces'
import { getNewMessages, sendContact, sendMessage, startChat } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading, timestamp2TextComplex } from '../../utils/utils'

import { clearUnread } from '../../utils/chatCache'

const DEFAULT_CHAT_PAGE_COUNT = 15

let systemChatPage
let curPage = 0

let formatList = (list: Array<Message>) => {
    let lastTime = -1
    list.forEach((item: Message) => {
        if (item.type !== 'fake_hint') {
            if (lastTime === -1 || (item.timeStamp - lastTime) > 60) {
                item.timeString = timestamp2TextComplex(item.timeStamp)
            }
            lastTime = item.timeStamp
        }
    })
    return list
}

let getLastTimestamp = (list: Array<Message>) => {
    let timestamp = -1
    if (list && list.length > 0) {
        for (let i = list.length - 1; i >= 0; i--) {
            if (!list[i].isFake && list[i].type !== 'fake_hint') {
                timestamp = list[i].timeStamp
                break
            }
        }
    }
    return timestamp
}

let mergeNewMessages = (oldMsgs: Array<Message>, newMsgs: Array<Message>, timestamp: number) => {
    let result = new Array<Message>()
    if (oldMsgs) {
        for (let i = 0; i < oldMsgs.length; i++) {
            if (oldMsgs[i].timeStamp > timestamp) {
                break
            }
            result.push(oldMsgs[i])
        }
    }
    return formatList(result.concat(newMsgs))
}

Page({
  data: {
      screenHeight: 0,
      otherId: 0,
      self: {},
      other: {},
      messages: [],
      showLoadingMore: false,
      noMore: false,
      showContent: false,
  },

  onLoad: function(options: any): void {
    systemChatPage = this

    systemChatPage.setData({
        screenHeight: getScreenSizeInRpx().height,
    })
    systemChatPage.loadData()
  },

  onRefresh: (e) => {
      let messages = systemChatPage.data.messages as Array<Message>
      let timestamp = getLastTimestamp(messages)
      let otherId = systemChatPage.data.otherId

      if (timestamp > 0) {
          showLoading('正在加载...')
          getNewMessages(otherId, timestamp, (result: Array<Message>) => {
              hideLoading()
              let newMsgs = mergeNewMessages(messages, result, timestamp)
              systemChatPage.setData({
                  messages: newMsgs,
              })
              systemChatPage.scrollToBottom()
              let newTimestamp = getLastTimestamp(newMsgs)
              clearUnread(otherId, newTimestamp)
          }, (failure) => {
              hideLoading()
              if (!failure.data) {
                  showErrDialog('无法加载数据，请检查你的网络')
              }
          })
      } else {
          systemChatPage.loadData()
      }
  },

  loadData: () => {
    let otherId = systemChatPage.data.otherId
    curPage = 0
    showLoading('正在加载...')
    startChat(otherId, DEFAULT_CHAT_PAGE_COUNT, curPage, (data: ChatData) => {
        hideLoading()
        let noMore = (data.messages.length < DEFAULT_CHAT_PAGE_COUNT)
        wx.setNavigationBarTitle({
            title: data.other.nickname,
        })
        systemChatPage.setData({
            self: data.self,
            other: data.other,
            messages: formatList(data.messages),
            noMore: noMore,
            showContent: true,
        })
        systemChatPage.scrollToBottom()
        clearUnread(otherId, data.timestamp)
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('无法加载数据，请检查你的网络')
        }
    })
  },

  // TODO: 无法定位到之前的位置，貌似可以用scroll-into-view，但是效果不是很理想
  onLoadMore: (e) => {
    let otherId = systemChatPage.data.other.id
    if (otherId) {
        if (systemChatPage.data.noMore || systemChatPage.data.showLoadingMore) {
            return
        }
        curPage++
        systemChatPage.showLoadingMore()
        startChat(otherId, DEFAULT_CHAT_PAGE_COUNT, curPage, (data: ChatData) => {
            systemChatPage.hideLoadingMore()
            let noMore = (data.messages.length < DEFAULT_CHAT_PAGE_COUNT)
            let newData = formatList(data.messages)
            let oldData = systemChatPage.data.messages
            systemChatPage.setData({
                messages: newData.concat(oldData),
                noMore: noMore,
            })
        }, (failure) => {
            systemChatPage.hideLoadingMore()
            if (!failure.data) {
                showErrDialog('无法加载数据，请检查你的网络')
            }
        })
    }
  },

  scrollToBottom: () => {
      systemChatPage.setData({
          scrollTop: 99999999,
      })
  },

  showLoadingMore: () => {
    systemChatPage.setData({
        showLoadingMore: true,
    })
  },

  hideLoadingMore: () => {
    systemChatPage.setData({
        showLoadingMore: false,
    })
  },

  onSystemMsgTap: (e) => {
      let router = e.currentTarget.dataset.router
      let extra = e.currentTarget.dataset.extra
      // TODO 先hard code一下，后面搞一个router出来，服务器发下来就直接可以跳
      if (router) {
          if (router === 'card' && extra) {
              wx.navigateTo({
                  url: '../card/card?id=' + extra,
              })
          } else if (router === 'follower') {
              wx.navigateTo({
                  url: '../user/follow?content=followers',
              })
          } else if (router === 'newcard' && extra) {
              wx.navigateTo({
                  url: '../card/card?id=' + extra + '&admin=1',
              })
          }
      }
  },
})
