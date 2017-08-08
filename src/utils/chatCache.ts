import { ChatListItem } from '../api/interfaces'

const CACHE_CHAT_LIST = 'chat_list'

let chatList: Array<ChatListItem>

export const getChatListCache = () => {
    if (!chatList) {
        chatList = wx.getStorageSync(CACHE_CHAT_LIST)
    }
    return chatList
}

export const setChatListCache = (newList: Array<ChatListItem>) => {
    chatList = newList
    wx.setStorage({
        key: CACHE_CHAT_LIST,
        data: chatList,
    })
}

export const clearUnread = (otherId: number) => {
    let changed = false
    chatList.forEach((item: ChatListItem) => {
        if (item.user.id === otherId) {
            if (item.unreadCount > 0) {
                changed = true
            }
            item.unreadCount = 0
        }
    })

    if (changed) {
        wx.setStorage({
            key: CACHE_CHAT_LIST,
            data: chatList,
        })
    }
}
