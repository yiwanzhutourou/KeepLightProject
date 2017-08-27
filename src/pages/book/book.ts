import { getBookCards, getBookDetails } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, parseTimeToDate, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { CardDetail } from '../../api/interfaces'
import { parseAuthor } from '../../utils/bookUtils'
import { setBookDetailData } from '../../utils/bookCache'
import { setPostBookData } from '../../utils/postCache'

const DEFAULT_BOOK_CARDS_PAGE_SIZE = 5

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

Page({
  data: {
      isbn: '',
      screenHeight: 0,
      bookDetail: null,
      discoverList: [],
      showEmpty: false,
      showList: false,
      showLoadingMore: true,
      noMore: false,
      showClickLoadMore: true,
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
            bookPage.loadBookCards()
        }
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showErrDialog('无法加载图书详情，请检查你的网络状态')
        }
    })
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
          pageCount = 0
          getBookCards(isbn, pageCount, DEFAULT_BOOK_CARDS_PAGE_SIZE,
            (cards: Array<CardDetail>) => {
                bookPage.setData({
                    discoverList: formatList(cards),
                    showEmpty: cards.length === 0,
                    showList: cards.length > 0,
                })
            }, (failure) => {
                if (!failure.data) {
                    showErrDialog('无法加载图书卡片，请检查你的网络')
                }
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
          url: '../card/card?id=' + id,
      })
  },
})
