import { ChatListData, ChatListItem } from '../api/interfaces'

import { getChatList } from '../api/api'

const CACHE_CHAT_LIST = 'chat_list'

let chatList: ChatListData

export const getChatListCache = () => {
    if (!chatList) {
        chatList = wx.getStorageSync(CACHE_CHAT_LIST)
    }
    return chatList
}

export const setChatListCache = (newData: ChatListData) => {
    chatList = newData
    wx.setStorage({
        key: CACHE_CHAT_LIST,
        data: chatList,
    })
}

export const removeItemFromChatCache = (otherId: number) => {
    let list = getChatListCache()
    if (list && list.messages) {
        let i = list.messages.length - 1
        while (i >= 0) {
            let item = list.messages[i]
            if (item.user.id === otherId) {
                list.messages.splice(i, 1)
            }
            i--
        }
    }

    wx.setStorage({
        key: CACHE_CHAT_LIST,
        data: chatList,
    })
}

export const clearUnread = (otherId: number, localTimestamp: number) => {
    chatList.messages.forEach((item: ChatListItem) => {
        if (item.user.id === otherId) {
            item.unreadCount = 0
            item.localTimestamp = localTimestamp
        }
    })

    wx.setStorage({
        key: CACHE_CHAT_LIST,
        data: chatList,
    })
}

export const getChatListTimestamp = (otherId: number) => {
    let list = getChatListCache()
    if (list) {
        chatList.messages.forEach((item: ChatListItem) => {
            if (item.user.id === otherId) {
                if (item.localTimestamp && item.localTimestamp > 0) {
                    return item.localTimestamp
                }
            }
        })
        return list.timestamp
    }
    return -1
}
