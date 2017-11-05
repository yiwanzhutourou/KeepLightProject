import { getBookDetails, getUploadToken, insertCardNew, modifyBookCard, newBookCard } from '../../api/api'
import { getScreenSizeInRpx, hideLoading, showDialog, showErrDialog, showLoading, trim } from '../../utils/utils'
import { initUploader, uploadFile } from '../../utils/qiniuUploader'

import { getPostModifyData } from '../../utils/postCache'
import { updateNeedRefreshCard } from '../../utils/shareData'

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
            imgPath: data.picUrl ? data.picUrl : '',
            defaultTitle: data.title,
            defaultContent: data.content,
        })
    }
  },

  onShow: function (): void {
    let data = getPostModifyData()
    if (data && data.book) {
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
                    imageModified: true,
                })
            }
        },
    })
  },

  onDeleteImage: (e) => {
      postPage.setData({
          imgPath: '',
          imageModified: true,
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
    if (imgPath && imgPath !== '') {
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
      if (imageModified && imgPath && imgPath !== '') {
          // upload image first
          initQiniu()
          getUploadToken((token: string) => {
              if (token) {
                  uploadFile(imgPath, (success) => {
                      let imgUrl = success.imageURL
                      postPage.modifyBookCard(cardId, content, title, imgUrl, 1)
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
          postPage.modifyBookCard(cardId, content, title, '', imageModified ? 1 : 0)
      }
  },

  insertNewBookCard: (content: string, title: string, picUrl: string, bookIsbn: string) => {
    if (bookIsbn) {
        getBookDetails(bookIsbn, (doubanBook: any) => {
            if (doubanBook) {
                insertCardNew(content, title, picUrl, doubanBook,
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
            } else {
                showErrDialog('无法加载图书详情，请稍后再试')
            }
        }, (failure) => {
            hideLoading()
            showErrDialog('无法加载图书详情，请检查你的网络状态')
        })
    } else {
        insertCardNew(content, title, picUrl, '',
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
    }
  },

  modifyBookCard: (cardId: number, content: string, title: string, picUrl: string, picModified: number) => {
    modifyBookCard(cardId, content, title, picUrl, picModified,
        (id: number) => {
            hideLoading()
            updateNeedRefreshCard(true)
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

  onAddBook: (e) => {
    wx.navigateTo({
        url: '../book/addBook?mode=select',
    })
  },
})
