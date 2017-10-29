import { getLibSettingData, getUploadToken, updateLibAddress, updateLibAvatar, updateLibInfo } from '../../api/api'
import { hideLoading, showDialog, showErrDialog, showLoading, trim } from '../../utils/utils'
import { initUploader, uploadFile } from '../../utils/qiniuUploader'

import { LibSettingData } from '../../api/interfaces'

let libsettingPage

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
      libId: '',
      libSettingData: {},
      addressText: '',
  },

  onLoad: function(options: any): void {
    libsettingPage = this

    if (!options || !options.id) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }
    libsettingPage.setData({
        libId: options.id,
    })
    showLoading('正在加载...')
    getLibSettingData(options.id, (result: LibSettingData) => {
        hideLoading()
        libsettingPage.setData({
          libSettingData: result,
          addressText: result && result.address ? result.address.detail : '',
        })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
          showErrDialog('加载失败，请检查你的网络')
      }
    })
  },

  formSubmit: (e) => {
      let name = e.detail.value.name
      if (trim(name).length === 0) {
          showErrDialog('昵称不能为空')
          return
      }

      let info = e.detail.value.info
      if (info.length > 200) {
          showErrDialog('简介不能超过 200 个字')
          return
      }

      showLoading('正在更新')
      // TODO 更新名称 & 简介
      libsettingPage.updateLibData(name, info)
  },

  updateLibData: (name: string, info: string) => {
    let id = libsettingPage.data.libId
    updateLibInfo(id, name, info, () => {
          wx.navigateBack({
              delta: 1,
          })
      }, (failure) => {
          hideLoading()
          if (!failure.data) {
              showErrDialog('更新失败，请检查你的网络')
          }
    })
  },

  onSettingAvatar: (e) => {
      wx.chooseImage({
          count: 1,
          success: (res) => {
              if (res && res.tempFilePaths && res.tempFilePaths[0]) {
                  libsettingPage.uploadImageAndUpdate(res.tempFilePaths[0])
              }
          },
      })
  },

  uploadImageAndUpdate: (imgUrl: string) => {
      if (imgUrl) {
        initQiniu()
        getUploadToken((token: string) => {
            if (token) {
                showLoading('正在上传图书馆图标，请稍后...')
                uploadFile(imgUrl, (success) => {
                    // 图片上传成功，更新服务器数据
                    libsettingPage.updateLibAvatar(success.imageURL)
                }, (fail) => {
                    hideLoading()
                    showErrDialog('上传头像失败，请稍后再试')
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
                showErrDialog('更新失败，请检查你的网络')
            }
        })
      }
  },

  updateLibAvatar: (avatarUrl: string) => {
      if (avatarUrl) {
        let id = libsettingPage.data.libId
        updateLibAvatar(id, avatarUrl, () => {
            hideLoading()
            let settingData = libsettingPage.data.libSettingData
            settingData.avatar = avatarUrl
            libsettingPage.setData({
                libSettingData: settingData,
            })
            showDialog('头像更新成功')
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('更新失败，请检查你的网络')
            }
        })
      }
  },
  
  onSettingAddress: (e) => {
    wx.chooseLocation({
        success: (res: WeApp.ChoosedLoaction) => {
          showLoading('正在添加地址')
          let id = libsettingPage.data.libId
          updateLibAddress(id, {
            name: res.name,
            detail: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
          }, (name: string) => {
            hideLoading()
            showDialog('设置成功')
            libsettingPage.setData({
                addressText: res.address,
            })
          }, (failure) => {
            hideLoading()
            if (!failure.data) {
              showErrDialog('无法获取数据，请检查你的网络状态')
            }
          })
        },
      })
  },
})
