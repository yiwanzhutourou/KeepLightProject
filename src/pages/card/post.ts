import { getScreenSizeInRpx, hideLoading, showDialog, showErrDialog, showLoading, trim } from '../../utils/utils'
import { getUploadToken, newBookCard } from '../../api/api'
import { initUploader, uploadFile } from '../../utils/qiniuUploader'

import { getPostData } from '../../utils/bookCache'

let postPage

const initQiniu = () => {
    let options = {
        region: 'ECN',
        imageURLPrefix: 'http:// othb16dht.bkt.clouddn.com',
        shouldUseQiniuFileName: true,
    }
    initUploader(options)
}

Page({
  data: {
      screenHeight: 0,
      book: null,
      imgPath: '',
  },

  onLoad: function(options: any): void {
    postPage = this
    postPage.setData({
        screenHeight: getScreenSizeInRpx().height,
    })
    let data = getPostData()
    if (data) {
        postPage.setData({
            book: data.book,
        })
    }
  },

  onChooseImage: (e) => {
    wx.chooseImage({
        count: 1,
        success: (res) => {
            if (res && res.tempFilePaths && res.tempFilePaths[0]) {
                postPage.setData({
                    imgPath: res.tempFilePaths[0],
                })
            }
        },
    })
  },

  onDeleteImage: (e) => {
    postPage.setData({
        imgPath: '',
    })
  },

  onPostSubmit: (e) => {
    let title = e.detail.value.title
    if (trim(title).length === 0) {
        showErrDialog('卡片标题不能为空')
        return
    }
    let content = e.detail.value.content
    if (trim(content).length === 0) {
        showErrDialog('卡片内容不能为空')
        return
    }
    showLoading('正在发布')
    let imgPath = postPage.data.imgPath
    let bookIsbn = postPage.data.book ? postPage.data.book.isbn : ''
    if (imgPath !== '') {
        // upload image first
        initQiniu()
        getUploadToken((token: string) => {
            if (token) {
                uploadFile(imgPath, (success) => {
                    let imgUrl = success.imageURL
                    postPage.insertNewBookCard(content, title, imgUrl, bookIsbn)
                }, (fail) => {
                    hideLoading()
                    showErrDialog('上传图片失败，请稍后再试')
                }, {
                    region: 'ECN',
                    imageURLPrefix: 'http://othb16dht.bkt.clouddn.com',
                    uploadToken: token,
                    shouldUseQiniuFileName: true,
                })
            }
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('发布失败，请检查你的网络')
            }
        })
    } else {
        postPage.insertNewBookCard(content, title, '', bookIsbn)
    }
  },

  insertNewBookCard: (content: string, title: string, picUrl: string, bookIsbn: string) => {
    newBookCard(content, title, picUrl, bookIsbn,
        (id: number) => {
            hideLoading()
            wx.redirectTo({
                url: './card?id=' + id
                    + '&showPostSuccess=1',
            })
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('发布失败，请检查你的网络')
            }
        })
  },
})
