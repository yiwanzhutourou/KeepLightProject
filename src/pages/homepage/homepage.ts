import { Book, GuideData, HomepageData, MyCardItem } from '../../api/interfaces'
import { addAddress, borrowBook, checkLoginFirstLaunch, getBookList, getGuideData, getHomepageData, getMyHomepageData, getUserInfo, removeBook, requestVerifyCode, setMobileBound, verifyCode } from '../../api/api'
import { hideLoading, parseTimeToDate, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'
import { replaceBookList, updateBookStatus } from '../../utils/bookCache'
import { setHomeSettingData, setShowGuide, shouldShowGuide } from '../../utils/urlCache'

import { getAddressDisplayText } from '../../utils/addrUtils'
import { verifyReg } from '../../utils/reg'

let homepage
let timeoutCount

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

let countDown = () => {
    let countDownTime = homepage.data.countDownTime
    if (countDownTime === 0) {
        homepage.setData({
            counting: false,
            requestText: '重新获取',
            countDownTime: 60,
        })
        return
    } else {
        homepage.setData({
            counting: true,
            requestText: countDownTime + ' 秒',
            countDownTime: countDownTime - 1,
        })
    }
    timeoutCount = setTimeout(countDown, 1000)
}

Page({
  data: {
    isHomePage: true, // always true
    // 我的书房页面，这两个参数一直是true
    isCurrentUser: true,
    isMyPage: false, // 不显示删除按钮

    userId: 0,
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

    showBindMobile: false,
    showGuide: false,

    // bind mobile
    countDownTime: 60,
    counting: false,
    requestText: '获取验证码',
    mobile: '',

    guideData: {},
  },
  
  onLoad: function(option: any): void {
    homepage = this
  },

  onUnload: () => {
      clearTimeout(timeoutCount)
  },

  onShow: function (): void {
      // STEP 1: 检查微信是否已经绑定了
      checkLoginFirstLaunch(() => {
        homepage.checkShowGuide()
      }, () => {
        // 进引导创建书房的流程
        let userInfo = getUserInfo() as any
        let welcomeText = '欢迎来到有读书房'
        if (userInfo && userInfo.nickName) {
          welcomeText = userInfo.nickName + '，' + welcomeText
        }
        homepage.setData({
          showContent: true,
          showBindMobile: true,
          showGuide: false,
          userInfo: userInfo,
          welcomeText: welcomeText,
        })
      })
  },

  checkShowGuide: () => {
      if (shouldShowGuide()) {
          getGuideData((result: GuideData) => {
            hideLoading()
            if (result.info
                && result.info !== ''
                && result.address
                && result.address.length > 0
                && result.contact
                && result.contact.contact) {
                  setShowGuide()
                  homepage.loadData()
            } else {
                let userInfo = getUserInfo() as any
                let welcomeText = '欢迎来到有读书房'
                if (userInfo && userInfo.nickName) {
                  welcomeText = userInfo.nickName + '，' + welcomeText
                }
                homepage.setData({
                  showContent: true,
                  showBindMobile: false,
                  showGuide: true,
                  guideData: result,
                  userInfo: userInfo,
                  welcomeText: welcomeText,
                })
            }
          }, (failure) => {
            hideLoading()
            if (!failure.data) {
              homepage.setData({
                showNetworkError: true,
                showContent: false,
              })
            }
          })
      } else {
          homepage.loadData()
      }
  },

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    getMyHomepageData((result: HomepageData) => {
      hideLoading()
      let books = result.books
      homepage.setData({
        userId: result.userId,
        homepageData: {
          nickname: result.nickname,
          avatarUrl: result.avatar ? result.avatar : '/resources/img/default_avatar.png',
          userIntro: result.info,
        },
        cardList: formatCards(result.cards),
        cardCount: result.cardCount,
        bookList: books,
        showContent: true,
        showNetworkError: false,
        addressText: getAddressDisplayText(result.address),
        followed: result.followed,
        followerNumber: result.followerCount,
        followingNumber: result.followingCount,
        showBindMobile: false,
        showGuide: false,
      })
      replaceBookList(books)
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        homepage.setData({
          showNetworkError: true,
          showContent: false,
        })
      }
    })
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

  onRemoveBook: (e) => {
    showConfirmDialog('', '确认从你的书房中移除《' + e.currentTarget.dataset.title + '》？', (confirm: boolean) => {
      if (confirm) {
        showLoading('正在删除')
        removeBook(e.currentTarget.dataset.isbn, (isbn: string) => {
          hideLoading()
          if (homepage.data.bookList) {
            let bookList: Array<Book> = []
            homepage.data.bookList.forEach((book: Book) => {
              let added = book.added
              if (isbn !== book.isbn) {
                bookList.push({
                  isbn: book.isbn,
                  title: book.title,
                  author: book.author,
                  url: book.url,
                  cover: book.cover,
                  publisher: book.publisher,
                  added: true,
                })
              }
            })
            homepage.setData({
              bookList: bookList,
            })
            if (homepage.data.isCurrentUser) {
              updateBookStatus(isbn, false)
            }
          }
        }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法删除图书，请检查你的网络')
          }
        })
      }
    })
  },

  onShareAppMessage: () => {
    if (homepage.data.homepageData) {
      return {
        title: homepage.data.homepageData.nickname,
        path: 'pages/homepage/homepage2?user=' + homepage.data.userId,
      }
    } else {
      return {
        title: '有读书房',
        path: 'pages/index/index',
      }
    }
  },

  onInputMobile: (e) => {
      homepage.setData({
        mobile: e.detail.value,
      })
  },
  
  onRequestCode: (e) => {
      if (homepage.data.counting) {
          return
      }

      let mobile = homepage.data.mobile
      if (!verifyReg(mobile, 'mobile')) {
        showErrDialog('请输入正确的 11 位手机号')
        return
      }

      countDown()
      showLoading('正在获取验证码...')
      requestVerifyCode(mobile, (result: string) => {
          hideLoading()
          if (result === 'ok') {
              showDialog('验证码已发送，请注意查收')
          }
      }, (failure) => {
          hideLoading()
          if (!failure.data) {
            homepage.setData({
              showNetworkError: true,
              showContent: false,
            })
          }
      })
  },

  formSubmit: (e) => {
      let mobile = e.detail.value.mobile_input
      if (!verifyReg(mobile, 'mobile')) {
        showErrDialog('请输入正确的 11 位手机号')
        return
      }

      let code = e.detail.value.code_input
      if (!verifyReg(code, 'smscode')) {
        showErrDialog('请输入 6 位数字验证码')
        return
      }

      showLoading('正在验证')
      verifyCode(mobile, code, (result: string) => {
          hideLoading()
          if (result === 'ok') {
              setMobileBound(true)
              showDialog('绑定成功')
              homepage.checkShowGuide()
          }
      }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法获取数据，请检查你的网络状态')
          }
      })
  },

  onAddAddress: (e) => {
    wx.navigateTo({
        url: '../user/address?autoClose=1',
    })
  },

  onAddContact: (e) => {
    wx.navigateTo({
        url: '../user/contact?autoClose=1',
    })
  },

  onAddIntro: (e) => {
    wx.navigateTo({
        url: '../user/changeintro?autoClose=1',
    })
  },

  onSkip: (e) => {
    showConfirmDialog('确认', '确定要跳过剩下的设置项？', (confirm) => {
      if (confirm) {
        setShowGuide()
        homepage.loadData()
      }
    })
  },

  onCardItemTap: (e) => {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
        url: '../card/card?id=' + id,
    })
  },

  onShowAllCards: (e) => {
    let userId = homepage.data.userId
    wx.navigateTo({
        url: '../card/usercards?user=' + userId,
    })
  },

  onEditHome: (e) => {
    let data = homepage.data.homepageData
    setHomeSettingData({
        nickname: data.nickname,
        avatar: data.avatarUrl,
        intro: data.userIntro,
        addressText: homepage.data.addressText,
    })
    wx.navigateTo({
        url: '../user/homesetting',
    })
  },
})
