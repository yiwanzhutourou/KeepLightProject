import { ChatData, Message } from '../../api/interfaces'
import { getScreenSizeInRpx, hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading, showToast, timestamp2TextComplex } from '../../utils/utils'
import { sendContact, sendMessage, startChat } from '../../api/api'

const DEFAULT_CHAT_PAGE_COUNT = 15

let chatPage
let curPage = 0
let lastRequest = -1

let formatList = (list: Array<Message>) => {
    let lastTime = -1
    list.forEach((item: Message) => {
        if (lastTime === -1 || (item.timeStamp - lastTime) > 60) {
            item.timeString = timestamp2TextComplex(item.timeStamp)
        }
        lastTime = item.timeStamp
    })
    return list
}

let fakeAdd = (message: Message, list: Array<Message>) => {
    if (message && list) {
        let timestamp = message.timeStamp
        if (list.length > 0) {
            let lastMessage = list[list.length - 1]
            if ((timestamp - lastMessage.timeStamp) > 60) {
                message.timeString = timestamp2TextComplex(timestamp)
            }
        } else {
            message.timeString = timestamp2TextComplex(timestamp)
        }
        message.showLoading = true
        list.push(message)
    }
}

Page({
  data: {
      screenHeight: 0,
      self: {},
      other: {},
      messages: [],
      inputValue: '',
      showLoadingMore: false,
      noMore: false,
  },

  onLoad: function(options: any): void {
    chatPage = this

    if (options && options.otherId) {
        chatPage.setData({
            screenHeight: getScreenSizeInRpx().height,
        })
        curPage = 0
        showLoading('正在加载...')
        startChat(options.otherId, DEFAULT_CHAT_PAGE_COUNT, curPage, (data: ChatData) => {
            hideLoading()
            let noMore = (data.messages.length < DEFAULT_CHAT_PAGE_COUNT)
            wx.setNavigationBarTitle({
                title: data.other.nickname,
            })
            chatPage.setData({
                self: data.self,
                other: data.other,
                messages: formatList(data.messages),
                noMore: noMore,
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

  // TODO: 无法定位到之前的位置，貌似可以用scroll-into-view，但是效果不是很理想
  onLoadMore: (e) => {
    let otherId = chatPage.data.other.id
    if (otherId) {
        if (lastRequest != -1 && e.timeStamp && e.timeStamp - lastRequest < 500) {
            return
        }
        lastRequest = e.timeStamp
        if (chatPage.data.noMore || chatPage.data.showLoadingMore) {
            return
        }
        curPage++
        chatPage.showLoadingMore()
        startChat(otherId, DEFAULT_CHAT_PAGE_COUNT, curPage, (data: ChatData) => {
            chatPage.hideLoadingMore()
            let noMore = (data.messages.length < DEFAULT_CHAT_PAGE_COUNT)
            let newData = formatList(data.messages)
            let oldData = chatPage.data.messages
            chatPage.setData({
                messages: newData.concat(oldData),
                noMore: noMore,
            })
        }, (failure) => {
            chatPage.hideLoadingMore()
            if (!failure.data) {
                showErrDialog('无法加载数据，请检查你的网络')
            }
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
      let otherId = chatPage.data.other.id
      if (!otherId) {
          return
      }
      if (!message || message === '') {
          return
      }

      // 本地fake一个message
      let messages = chatPage.data.messages
      let timestamp = new Date().getTime() / 1000
      let newIndex = messages.length
      fakeAdd({
          'type': 'message',
          'from': chatPage.data.self.id,
          'to': otherId,
          'content': message,
          'timeStamp': timestamp,
      }, messages)
      chatPage.setData({
          messages: messages,
      })
      chatPage.scrollToBottom()

      sendMessage(otherId, message, (result: string) => {
          messages[newIndex].showLoading = false
          messages[newIndex].showError = false
          chatPage.setData({
            messages: messages,
          })
          chatPage.scrollToBottom()
      }, (failure) => {
          if (!failure.data) {
              messages[newIndex].showLoading = false
              messages[newIndex].showError = true
              chatPage.setData({
                  messages: messages,
              })
              chatPage.scrollToBottom()
          }
      })
  },

  onErrorMsgTap: (e) => {
      let index = e.currentTarget.dataset.index
      let messages = chatPage.data.messages
      if (messages[index].showError) {
        let otherId = chatPage.data.other.id
        let message = messages[index].content
        messages[index].showError = false
        messages[index].showLoading = true
        chatPage.setData({
          messages: messages,
        })
        sendMessage(otherId, message, (result: string) => {
            messages[index].showLoading = false
            chatPage.setData({
                messages: messages,
            })
            chatPage.scrollToBottom()
        }, (failure) => {
            if (!failure.data) {
                messages[index].showLoading = false
                messages[index].showError = true
                chatPage.setData({
                    messages: messages,
                })
                chatPage.scrollToBottom()
            }
        })
      }
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

  onSendContactTap: (e) => {
    let otherId = chatPage.data.other.id
    if (!otherId) {
        return
    }
    showConfirmDialog('', '将发送你设置的联系方式给对方，是否继续？', (confirm) => {
        if (confirm) {
            showLoading('正在发送')
            sendContact(otherId, (result: string) => {
                hideLoading()
                if (result === 'no') {
                    wx.showModal({
                        title: '提醒',
                        content: '你还没有设置联系方式',
                        confirmText: '去设置',
                        success: (res) => {
                            if (res && res.confirm) {
                                wx.navigateTo({
                                    url: '../user/contact?autoClose=1',
                                })
                            }
                        },
                    })
                } else {
                    // 本地fake一个contact message
                    let messages = chatPage.data.messages
                    let timestamp = new Date().getTime() / 1000
                    fakeAdd({
                        'type': 'contact',
                        'from': chatPage.data.self.id,
                        'to': otherId,
                        'timeStamp': timestamp,
                        'extra': JSON.parse(result),
                    }, messages)
                    chatPage.setData({
                        messages: messages,
                    })
                    chatPage.scrollToBottom()
                }
            }, (failure) => {
                hideLoading()
                if (!failure.data) {
                    showErrDialog('发送失败，请检查你的网络')
                }
            })
        }
    })
  },

  onShowUserTap: (e) => {
      if (chatPage.data.other) {
          wx.navigateTo({
            url: '../homepage/homepage2?user=' + chatPage.data.other.id,
          })
      }
  },

  onCopyContact: (e) => {
      let name = e.currentTarget.dataset.name
      let contact = e.currentTarget.dataset.contact
      if (name && contact) {
        wx.setClipboardData({
            data: contact,
            success: (result) => {
                showToast(name + '已复制')
            },
        })
      }
  },

  onRequestTap: (e) => {
        let isbn = e.currentTarget.dataset.isbn

        if (isbn) {
            wx.navigateTo({
                url: '../book/book?isbn=' + isbn,
            })
        }
  },

  showLoadingMore: () => {
    chatPage.setData({
        showLoadingMore: true,
    })
  },

  hideLoadingMore: () => {
    chatPage.setData({
        showLoadingMore: false,
    })
  },
})
