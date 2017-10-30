import { Book } from '../../api/interfaces'
import { getLibBooks } from '../../api/api'
import { hideLoading } from '../../utils/utils'

let libbooksPage

Page({
  data: {
    libId: '',
    bookList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(options: any): void {
    libbooksPage = this

    if (!options || !options.id) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }
    libbooksPage.setData({
        libId: options.id,
    })
  },

  onShow: function (): void {
    libbooksPage.loadData()
  },

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    let libId = libbooksPage.data.libId
    getLibBooks(libId, (books: Array<Book>) => {
      hideLoading()
      libbooksPage.setData({
        bookList: books,
        showEmpty: books.length == 0,
        showList: books.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        libbooksPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    libbooksPage.loadData()
  },

  onUploadBook: (e) => {
    wx.navigateBack({
      delta: 1,
    })
  },

  onBookItemTap: (e) => {
    let isbn = e.currentTarget.dataset.isbn
    wx.navigateTo({
        url: '../book/book?isbn=' + isbn,
    })
  },
})
