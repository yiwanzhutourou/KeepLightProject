import { Book, HomepageData, MyCardItem } from '../../api/interfaces'
import { addAddress, borrowBook, follow, getBookList, getHomepageData, removeBook, unfollow } from '../../api/api'
import { hideLoading, parseTimeToDate, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'
import { replaceBookList, updateBookStatus, updateBorrowData } from '../../utils/bookCache'

import { getAddressDisplayText } from '../../utils/addrUtils'
import { parseAuthor } from '../../utils/bookUtils'

let homepage2

const formatCards = (cards: Array<MyCardItem>) => {
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
    userId: '',
    isHomePage: true, // always true
    isCurrentUser: false,
    isMyPage: false, // always false

    homepageData: {},
    addressText: '',
    followed: false,
    followerNumber: 0,
    followingNumber: 0,
    cardList: [],
    cardCount: 0,
    bookList: [],
    showContent: false,
    showNetworkError: false,
  },

  onLoad: function(option: any): void {
    homepage2 = this

    showLoading('正在加载...')
    if (option && option.user) {
      homepage2.setData({
        userId: option.user,
      })
    }
  },

  onShow: function (): void {
      homepage2.loadData()
  },

  onReload: (e) => {
    showLoading('正在加载...')
    homepage2.loadData()
  },

  loadData: () => {
    let id = homepage2.data.userId
    getHomepageData(id, (result: HomepageData) => {
      hideLoading()
      let books = result.books
      homepage2.setData({
        homepageData: {
          nickName: result.nickname,
          avatarUrl: result.avatar ? result.avatar : '/resources/img/default_avatar.png',
          userIntro: result.info,
        },
        cardList: formatCards(result.cards),
        cardCount: result.cardCount,
        bookList: books,
        addressText: getAddressDisplayText(result.address),
        showContent: true,
        showNetworkError: false,
        isCurrentUser: result.isMe,
        followed: result.followed,
        followerNumber: result.followerCount,
        followingNumber: result.followingCount,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        if (!homepage2.data.homepageData.nickName) {
          homepage2.setData({
            showNetworkError: true,
            showContent: false,
          })
        }
      }
    })
  },

  onBorrowBook: (e) => {
    let book = e.currentTarget.dataset.book
    let userId = homepage2.data.userId
    let user = homepage2.data.homepageData
    if (book && userId && user) {
      updateBorrowData({
        user: {
          id: userId,
          nickname: user.nickName,
          avatar: user.avatarUrl,
        },
        book: {
          isbn: book.isbn,
          title: book.title,
          author: parseAuthor(book.author, ' '),
          cover: book.cover,
          publisher: book.publisher,
        },
      })
      wx.navigateTo({
        url: '../chat/borrow',
      })
    }
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },

  onUploadBook: (e) => {
    wx.switchTab({
      url: '../book/addBook',
    })
  },

  onShareAppMessage: () => {
    if (homepage2.data.homepageData) {
      return {
        title: homepage2.data.homepageData.nickName,
        path: 'pages/homepage/homepage2?user=' + homepage2.data.userId,
      }
    } else {
      return {
        title: '有读书房',
        path: 'pages/index/index',
      }
    }
  },

  onFollowTap: (e) => {
    let userId = homepage2.data.userId
    if (userId) {
      showLoading('正在关注')
      follow(userId, (result: string) => {
        hideLoading()
        showDialog('已关注')
        homepage2.setData({
          followed: true,
          followerNumber: homepage2.data.followerNumber + 1,
        })
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
            if (!failure.data) {
                showErrDialog('无法关注，请检查你的网络')
            }
        }
      })
    }
  },

  onUnfollowTap: (e) => {
    let userId = homepage2.data.userId
    if (userId) {
      showLoading('正在取消')
      unfollow(userId, (result: string) => {
        hideLoading()
        showDialog('已取消')
        homepage2.setData({
          followed: false,
          followerNumber: homepage2.data.followerNumber - 1,
        })
      }, (failure) => {
        hideLoading()
        if (!failure.data) {
            if (!failure.data) {
                showErrDialog('取消关注失败，请检查你的网络')
            }
        }
      })
    }
  },

  onChatTap: (e) => {
      let otherId = homepage2.data.userId
      if (otherId) {
          wx.navigateTo({
              url: '../chat/chat?otherId=' + otherId,
          })
      }
  },

  onCardItemTap: (e) => {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
        url: '../card/card?id=' + id,
    })
  },

  onShowAllCards: (e) => {
    let userId = homepage2.data.userId
    wx.navigateTo({
        url: '../card/usercards?user=' + userId,
    })
  },
})
