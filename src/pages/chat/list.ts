import { ChatListData, ChatListItem } from '../../api/interfaces'
import { deleteChat, getChatList } from '../../api/api'
import { getChatListCache, getChatListTimestamp, removeItemFromChatCache, setChatListCache } from '../../utils/chatCache'
import { hideLoading, showErrDialog, showLoading, timestamp2Text } from '../../utils/utils'

const REFRESH_INTERVAL = 5 * 60 * 1000

let chatListPage
let lastLoadTime = -1
let longTapLock = false

let removeChatItem = (list: Array<ChatListItem>, userId: number) => {
    if (list) {
        let i = list.length - 1
        while (i >= 0) {
            if (list[i].user.id === userId) {
                list.splice(i, 1)
            }
            i--
        }
    }
}

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
            chatList: chatListPage.formatList(list.messages),
            showList: list.messages.length > 0,
            showEmpty: list.messages.length == 0,
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
    getChatList((data: ChatListData) => {
      hideLoading()
      chatListPage.setData({
        chatList: chatListPage.formatList(data.messages),
        showList: data.messages.length > 0,
        showEmpty: data.messages.length == 0,
      })
      setChatListCache(data)
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
    getChatList((data: ChatListData) => {
      wx.stopPullDownRefresh()
      chatListPage.setData({
        chatList: chatListPage.formatList(data.messages),
        showList: data.messages.length > 0,
        showEmpty: data.messages.length == 0,
      })
      setChatListCache(data)
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
    if (longTapLock) {
        longTapLock = false
        return
    }
    wx.navigateTo({
        url: '../chat/chat?otherId=' + e.currentTarget.dataset.user,
    })
  },

  onChatItemLongTap: (e) => {
    longTapLock = true
    let user = e.currentTarget.dataset.user
    if (!user) {
      return
    }
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#E64340',
      success: (res) => {
        if (res && res.tapIndex === 0) {
          showLoading('正在删除')
          let timestamp = getChatListTimestamp(user)
          deleteChat(user, timestamp, (result: string) => {
            hideLoading()
            let messages = chatListPage.data.chatList
            removeChatItem(messages, user)
            chatListPage.setData({
              chatList: messages,
              showList: messages.length > 0,
              showEmpty: messages.length == 0,
            })
            removeItemFromChatCache(user)
          }, (failure) => {
            hideLoading()
            if (!failure.data) {
              showErrDialog('无法删除，请检查你的网络')
            }
          })
        }
      },
    })
  },

  onGotoIndex: (e) => {
    wx.switchTab({
      url: '../index/index',
    })
  },
})
