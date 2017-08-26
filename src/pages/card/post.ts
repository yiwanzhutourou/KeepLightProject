import { getScreenSizeInRpx, hideLoading, showDialog, showErrDialog, showLoading, trim } from '../../utils/utils'
import { getUploadToken, modifyBookCard, newBookCard } from '../../api/api'
import { initUploader, uploadFile } from '../../utils/qiniuUploader'

import { getPostModifyData } from '../../utils/postCache'

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
      id: -1,
      isModify: 0,
      postText: '发布',
      book: null,
      imgPath: '',
      defaultTitle: '',
      defaultContent: '',
      imageModified: false,
  },

  onLoad: function(options: any): void {
    postPage = this
    postPage.setData({
        screenHeight: getScreenSizeInRpx().height,
    })
    let data = getPostModifyData()
    if (data) {
        postPage.setData({
            id: data.id,
            isModify: data.isModify,
            postText: data.isModify ? '修改' : '发布',
            book: data.book,
            imgPath: data.picUrl,
            defaultTitle: data.title,
            defaultContent: data.content,
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
                    imageModified: true,
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
    let isModify = postPage.data.isModify
    if (isModify) {
        postPage.postModify(title, content, imgPath)
    } else {
        postPage.postNew(title, content, bookIsbn, imgPath)
    }
  },

  postNew: (title: string, content: string, bookIsbn: string, imgPath: string) => {
    if (!imgPath && imgPath !== '') {
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
                    // TODO 放到服务端
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

  postModify: (title: string, content: string, imgPath: string) => {
      let cardId = postPage.data.id
      let imageModified = postPage.data.imageModified
      if (imageModified && !imgPath && imgPath !== '') {
          // upload image first
          initQiniu()
          getUploadToken((token: string) => {
              if (token) {
                  uploadFile(imgPath, (success) => {
                      let imgUrl = success.imageURL
                      postPage.modifyBookCard(cardId, content, title, imgUrl)
                  }, (fail) => {
                      hideLoading()
                      showErrDialog('上传图片失败，请稍后再试')
                  }, {
                      // TODO 放到服务端
                      region: 'ECN',
                      imageURLPrefix: 'http://othb16dht.bkt.clouddn.com',
                      uploadToken: token,
                      shouldUseQiniuFileName: true,
                  })
              }
          }, (failure) => {
              hideLoading()
              if (!failure.data) {
                  showErrDialog('修改失败，请检查你的网络')
              }
          })
      } else {
          postPage.modifyBookCard(cardId, content, title, '')
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

  modifyBookCard: (cardId: number, content: string, title: string, picUrl: string) => {
    modifyBookCard(cardId, content, title, picUrl,
        (id: number) => {
            hideLoading()
            wx.navigateBack({
                delta: 1,
            })
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('修改失败，请检查你的网络')
            }
        })
  },
})
