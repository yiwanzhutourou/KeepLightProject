import { getChatListCache, setChatListCache } from '../../utils/chatCache'
import { hideLoading, showErrDialog, showLoading, timestamp2Text } from '../../utils/utils'

import { ChatListItem } from '../../api/interfaces'
import { getChatList } from '../../api/api'

const REFRESH_INTERVAL = 5 * 60 * 1000

let chatListPage
let lastLoadTime = -1

Page({
  data: {
    chatList: [],
    showList: false,
    showEmpty: false,
    showNetworkError: false,
  },

  onLoad: function(options: any): void {
    chatListPage = this
  },

  onShow: function (): void {
    // 缓存里读一读数据
    let list = getChatListCache()
    if (list) {
        chatListPage.setData({
            chatList: chatListPage.formatList(list),
            showList: list.length > 0,
            showEmpty: list.length == 0,
        })
    }

    // 五分钟自动拉一次数据
    let now = new Date().getTime()
    if (lastLoadTime === -1 || (now - lastLoadTime) > REFRESH_INTERVAL) {
        chatListPage.loadData()
        lastLoadTime = now
    }
  },

  loadData: () => {
    showLoading('正在加载')
    getChatList((list: Array<ChatListItem>) => {
      hideLoading()
      chatListPage.setData({
        chatList: chatListPage.formatList(list),
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
      setChatListCache(list)
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        chatListPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    chatListPage.loadData()
  },

  onPullDownRefresh: (e) => {
    lastLoadTime = new Date().getTime()
    getChatList((list: Array<ChatListItem>) => {
      wx.stopPullDownRefresh()
      chatListPage.setData({
        chatList: chatListPage.formatList(list),
        showList: list.length > 0,
        showEmpty: list.length == 0,
      })
      setChatListCache(list)
    }, (failure) => {
      wx.stopPullDownRefresh()
      if (!failure.data) {
        showErrDialog('网络错误')
      }
    })
  },

  formatList: (list: Array<ChatListItem>) => {
    list.forEach((item: ChatListItem) => {
        if (item.message) {
            item.message = item.message.replace(/\n/g, ' ')
        }
        item.timeString = timestamp2Text(item.timeStamp)
    })
    return list
  },

  onChatItemTap: (e) => {
    wx.navigateTo({
        url: '../chat/chat?otherId=' + e.currentTarget.dataset.user,
    })
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },
})
