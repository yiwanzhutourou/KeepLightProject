import { hideLoading, showErrDialog, showLoading } from '../../utils/utils'

import { getBookDetails } from '../../api/api'
import { parseAuthor } from '../../utils/bookUtils'

let bookPage

Page({
  data: {
      bookDetail: null,
  },

  onLoad: function(option: any): void {
    bookPage = this

    if (!option || !option.isbn) {
        wx.navigateBack({
            delta: 1,
        })
    }
    if (option && option.title) {
        wx.setNavigationBarTitle({
            title: option.title,
        })
    }

    showLoading('正在加载...')
    getBookDetails(option.isbn, (result: any) => {
        hideLoading()
        bookPage.setData({
            bookDetail: {
                bigImage: result.images.large,
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
    }, (failure) => {
        hideLoading()
        showErrDialog('无法加载图书详情，请检查您的网络状态')
    })
  },

})
