import { Book, Result } from '../../api/interfaces'
// pages/homepage/homepage.js
import { getBookList, getUserInfo, getUserIntro, removeBook, setUserIntro } from '../../api/api'
import { hideLoading, showErrDialog, showLoading, showToast } from '../../utils/utils'

let homepage: WeApp.Page

Page({
  data: {
    userInfo: {},
    isCurrentUser: true,
    userIntro: '',
    showIntro: false,
    introEditting: false,
    editUserIntroText: '编辑',
    userIntroToEdit: '',
    bookList: [],
    isHomePage: true,
  },
  onLoad: function(option: any): void {
    homepage = this
    // 调用应用实例的方法获取全局数据
    // TODO: 判断用户是否为当前登录用户（存什么到服务器用来比较用户唯一性？）
    let isCurrentUser = true

    // 更新数据
    homepage.setData({
      userInfo: getUserInfo(),
    })

    // 获取用户简介
    getUserIntro((result: string) => {
      let intro = ''
      let showIntro = true
      let editUserIntroText = '编辑'
      let userIntroToEdit = ''
      if (!result || result === '') {
        if (isCurrentUser) {
          intro = '您还没有介绍您的书房'
          editUserIntroText = '添加简介'
        } else {
          showIntro = false
        }
      } else {
        intro = result
        userIntroToEdit = result
      }
      homepage.setData({
        userIntro: intro,
        showIntro: showIntro,
        editUserIntroText: editUserIntroText,
        userIntroToEdit: userIntroToEdit,
      })
    }, (failure) => {
      // TODO
    })
  },

  onShow: function (): void {
      showLoading('正在加载')
      getBookList((books: Array<Book>) => {
        hideLoading()
        this.setData({
          bookList: books,
        })
      }, (failure) => {
        hideLoading()
        showErrDialog('无法获取您的图书列表，请检查您的网络状态')
      })
  },

  chooseLocation: () => {
    wx.chooseLocation({
      success: (res: WeApp.ChoosedLoaction) => {
        // success
        homepage.setData({
          addressName: res.name,
        })
        showToast('添加成功')
      },
    })
  },

  onAddBookTap: () => {
    wx.navigateTo({
      url: '../book/addBook',
    })
  },

  onEditUserIntroTap: () => {
    homepage.setData({
      introEditting: true,
    })
  },

  onEditIntroDone: (e) => {
    let intro
    if (e.detail.value.textarea && typeof e.detail.value.textarea === 'string') {
      intro = e.detail.value.textarea
    } else if (e.detail.value && typeof e.detail.value === 'string') {
      intro = e.detail.value
    }
    setUserIntro(intro, () => {
      showToast('更新成功')
      homepage.setData({
        userIntro: intro,
        introEditting: false,
        editUserIntroText: '编辑',
        userIntroToEdit: intro,
      })
    }, (failure) => {
      // TODO
    })
  },

  onEditIntroCancel: () => {
    homepage.setData({
      introEditting: false,
    })
  },

  onBookItemTap: (e) => {
    // TODO: 微信小程序不支持WebView，需要一个图书详情页吗？
  },

  onRemoveBook: (e) => {
    showLoading('正在删除')
    console.log(e.currentTarget.dataset.isbn)
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
        showToast('删除成功')
      }
    }, (failure) => {
      hideLoading()
    })
  },
})
