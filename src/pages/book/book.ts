import { Book, BookPageData, CardDetail, SearchUser } from '../../api/interfaces'
import { addBook, addNewBook, getBookCards, getBookDetails, getBookPageData, removeBook } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, parseTimeToDate, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'
import { setBookDetailData, updateBookStatus } from '../../utils/bookCache'

import { getDistrictShortString } from '../../utils/addrUtils'
import { parseAuthor } from '../../utils/bookUtils'
import { setPostBookData } from '../../utils/postCache'

const DEFAULT_BOOK_CARDS_PAGE_SIZE = 5

let app = getApp()
let bookPage
let pageCount = 0

const formatList = (cards: Array<CardDetail>) => {
    if (cards && cards.length > 0) {
      cards.forEach((card: CardDetail) => {
         if (card.content) {
             card.content = card.content.replace(/\n/g, ' ')
         }
         card.timeString = parseTimeToDate(card.createTime)
      })
    }
    return cards
}

const formatUserList = (users: Array<SearchUser>) => {
    if (users && users.length > 0) {
      users.forEach((user: SearchUser) => {
          if (user.address) {
              user.addressText = user.address.city
                        ? getDistrictShortString(user.address.city) : user.address.detail
          } else {
              user.addressText = '暂无地址'
          }
      })
    }
    return users
}

Page({
  data: {
      isbn: '',
      screenHeight: 0,
      bookDetail: null,
      doubanBook: '',
      discoverList: [],
      showEmpty: false,
      showList: false,
      showLoadingMore: true,
      noMore: false,
      showClickLoadMore: true,
      userList: [],
      showUsers: false,
      showAddBook: false,
      extraLoaded: false,
  },

  onLoad: function(option: any): void {
    bookPage = this

    if (!option || !option.isbn) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }

    bookPage.setData({
        screenHeight: getScreenSizeInRpx().height,
        isbn: option.isbn,
    })

    showLoading('正在加载...')
    getBookDetails(option.isbn, (result: any) => {
        hideLoading()
        if (result) {
            bookPage.setData({
                doubanBook: result,
                bookDetail: {
                    bigImage: result.images ? result.images.large : '',
                    smallImage: result.image,
                    title: result.title,
                    author: parseAuthor(result.author, ' '),
                    publisher: result.publisher ? '出版社：' + result.publisher : '',
                    translator: result.translator ? '译者：' + result.translator : '',
                    pubdate: result.pubdate ? '出版时间：' + result.pubdate : '',
                    pages: result.pages ? '页数：' + result.pages : '',
                    binding: result.binding ? '装帧：' + result.binding : '',
                    series: result.series && result.series.title ? '丛书：' + result.series.title : '',
                    isbn: result.isbn13 ? 'ISBN：' + result.isbn13 : '',
                    summary: result.summary,
                    author_intro: result.author_intro,
                    catalog: result.catalog,
                },
            })
            if (result.title) {
                wx.setNavigationBarTitle({
                    title: result.title,
                })
            }
        } else {
            showErrDialog('无法加载图书详情，请稍后再试')
        }
    }, (failure) => {
        hideLoading()
        showErrDialog('无法加载图书详情，请检查你的网络状态')
    })

    bookPage.loadBookCards()
  },

  onShowContent: (e) => {
      let bookTitle = bookPage.data.bookDetail.title
      let title = e.currentTarget.dataset.title
      let content = e.currentTarget.dataset.content
      if (content) {
          setBookDetailData(bookTitle + ' - ' + title, content)
          wx.navigateTo({
              url: '../book/bookDetail',
          })
      }
  },

  loadBookCards: () => {
      let isbn = bookPage.data.isbn
      if (isbn) {
          app.getLocationInfo((locationInfo: WeApp.LocationInfo) => {
              // 无法定位就按在上海搜索
              let longitude = 121.438378
              let latitude = 31.181471
              if (locationInfo) {
                  latitude = locationInfo.latitude
                  longitude = locationInfo.longitude
              }
              pageCount = 0
              getBookPageData(isbn, pageCount, DEFAULT_BOOK_CARDS_PAGE_SIZE,
                latitude, longitude,
                (data: BookPageData) => {
                    if (data) {
                        bookPage.setData({
                            discoverList: formatList(data.cards),
                            showEmpty: data.cards.length === 0,
                            showList: data.cards.length > 0,
                            userList: formatUserList(data.users),
                            showUsers: data.users && data.users.length > 0,
                            showAddBook: data.hasBook === 0,
                            extraLoaded: true,
                        })
                    }
                }, (failure) => {
                    if (!failure.data) {
                        showErrDialog('无法加载图书卡片，请检查你的网络')
                    }
                })
          })
      }
  },

  onLoadMore: (e) => {
    if (bookPage.data.noMore) {
        return
    }
    let isbn = bookPage.data.isbn
    if (isbn) {
        pageCount++
        getBookCards(isbn, pageCount, DEFAULT_BOOK_CARDS_PAGE_SIZE,
          (cards: Array<CardDetail>) => {
              let oldList = bookPage.data.discoverList
              let noMore = cards.length === 0
              bookPage.setData({
                  discoverList: oldList.concat(formatList(cards)),
                  noMore: noMore,
                  showClickLoadMore: !noMore,
              })
          }, (failure) => {
              if (!failure.data) {
                  showErrDialog('无法加载图书卡片，请检查你的网络')
              }
          })
    }
  },

  onPostCard: (e) => {
      let book = {
          isbn: bookPage.data.isbn,
          title: bookPage.data.bookDetail.title,
          author: bookPage.data.bookDetail.author,
          cover: bookPage.data.bookDetail.smallImage,
      }
      setPostBookData(book)
      wx.navigateTo({
          url: '../card/post',
      })
  },

  onCardItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      wx.navigateTo({
          url: '../card/card?id=' + id + '&fromList=1',
      })
  },

  onUserItemTap: (e) => {
    let user = e.currentTarget.dataset.user
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + user,
    })
  },

  onShareAppMessage: () => {
      let bookDetail = bookPage.data.bookDetail
      let isbn = bookPage.data.isbn
      return {
          title: bookDetail.title,
          path: 'pages/book/book?isbn=' + isbn,
      }
  },

  onAddBook: (e) => {
    let doubanBook = bookPage.data.doubanBook
    if (!doubanBook) {
        return
    }
    showLoading('正在添加')
    addNewBook(doubanBook, () => {
      hideLoading()
      showDialog('已添加')
      bookPage.setData({
        showAddBook: false,
      })
      updateBookStatus(doubanBook.id, true)
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showErrDialog('无法添加图书，请检查你的网络')
      }
    })
  },

  onRemoveBook: (e) => {
    let isbn = bookPage.data.isbn
    if (!isbn) {
        return
    }
    let title = bookPage.data.bookDetail && bookPage.data.bookDetail.title ?
                    '《' + bookPage.data.bookDetail.title + '》' : '这本书'
    showConfirmDialog('', '确认从你的书房移除' + title + '？', (confirm: boolean) => {
      if (confirm) {
        showLoading('正在删除')
        removeBook(isbn, () => {
          hideLoading()
          showDialog('已移除')
          bookPage.setData({
            showAddBook: true,
          })
          updateBookStatus(isbn, false)
        }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法删除图书，请检查你的网络')
          }
        })
      }
    })
  },
})
