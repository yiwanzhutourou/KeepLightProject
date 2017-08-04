import { getScreenSizeInRpx, hideLoading, showErrDialog, showLoading } from '../../utils/utils'

import { ChatData } from '../../api/interfaces'
import { startChat } from '../../api/api'

let chatPage

let screenHeight

Page({
  data: {
      self: {},
      other: {},
      messages: [],
      inputValue: '',
  },

  onLoad: function(options: any): void {
    chatPage = this

    if (options && options.otherId) {
        screenHeight = getScreenSizeInRpx().height
        chatPage.setData({
            listHeight: screenHeight - 100,
        })
        showLoading('正在加载...')
        startChat(options.otherId, (data: ChatData) => {
            hideLoading()
            wx.setNavigationBarTitle({
                title: data.other.nickname,
            })
            chatPage.setData({
                self: data.self,
                other: data.other,
                messages: data.messages,
            })
            chatPage.scrollToBottom()
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('无法加载数据，请检查你的网络')
            }
        })
    } else {
        wx.navigateBack({
            delta: 1,
        })
    }
  },

  onInputComplete: (e) => {
      chatPage.clearInput()
      let message = e.detail.value
      chatPage.sendMessage(message)
  },

  onSendTap: (e) => {
      let message = chatPage.data.inputValue
      chatPage.sendMessage(message)
      chatPage.clearInput()
  },

  sendMessage: (message) => {
      if (!message || message === '') {
          return
      }
      let messages = chatPage.data.messages
      messages.push({
          'type': 'message',
          'from': chatPage.data.self.id,
          'to': chatPage.data.other.id,
          'content': message,
          'timeStamp': new Date().getTime(),
      })
      chatPage.setData({
          messages: messages,
      })
      chatPage.scrollToBottom()
  },

  onInput: (e) => {
      chatPage.setData({
          inputValue: e.detail.value,
      })
  },

  clearInput: () => {
      chatPage.setData({
          inputValue: '',
      })
  },

  scrollToBottom: () => {
      chatPage.setData({
          scrollTop: 99999999,
      })
  },
})
