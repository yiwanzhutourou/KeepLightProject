import { hideLoading, parseTimeToDate, showErrDialog, showLoading } from '../../utils/utils'

import { ArticleDetail } from '../../api/interfaces'
import { getArticleById } from '../../api/api'

let richcardPage

declare var require: any

const formatResult = (result: ArticleDetail) => {
    result.timeString = parseTimeToDate(result.createTime)
    // tslint:disable-next-line:no-require-imports
    let wxParse = require('../../wxParse/wxParse.js')
    wxParse.wxParse('article', 'md', result.content, richcardPage, 0)
    console.log(result)
    return result
}

Page({
    data: {
        articleId: '',
        cardDetail: null,
    },
  
    onLoad: function(option: any): void {
        richcardPage = this

        if (!option || !option.id) {
            wx.navigateBack({
                delta: 1,
            })
        } else {
            richcardPage.setData({
                articleId: option.id,
            })
            richcardPage.loadData()
        }
    },
  
    onShow: function (): void {
        // TODO
    },

    loadData: () => {
        let articleId = richcardPage.data.articleId
        if (!articleId || articleId < 0) {
            return
        }
        showLoading('正在加载...')
        getArticleById(articleId, (result: ArticleDetail) => {
            if (result.title) {
                wx.setNavigationBarTitle({
                    title: result.title,
                })
            }
            richcardPage.setData({
                cardDetail: formatResult(result),
            })
            hideLoading()
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('无法加载，请检查你的网络状态')
            }
        })
    },

    onPreviewImage: (e) => {
        let imgUrl = e.currentTarget.dataset.img
        if (imgUrl) {
            wx.previewImage({
                current: imgUrl,
                urls: [imgUrl],
            })
        }
    },

    onShareAppMessage: () => {
        let cardDetail = richcardPage.data.cardDetail
        return {
          title: '分享自有读书房的文章',
          path: 'pages/card/richcard?id=' + cardDetail.id,
        }
    },
})
