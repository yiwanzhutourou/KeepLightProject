import { clearHomeSettingData, getHomeSettingData } from '../../utils/urlCache'
import { getAddressCities, getUploadToken, updateHomeData } from '../../api/api'
import { hideLoading, showErrDialog, showLoading, trim } from '../../utils/utils'
import { initUploader, uploadFile } from '../../utils/qiniuUploader'

import { Address } from '../../api/interfaces'
import { getAddressDisplayText } from '../../utils/addrUtils'

let homesettingPage

const initQiniu = () => {
    let options = {
        region: 'ECN',
        imageURLPrefix: 'pic.youdushufang.com',
        shouldUseQiniuFileName: true,
    }
    initUploader(options)
}

Page({
  data: {
      homeData: {},
      imageModified: false,
      addressText: '',
  },

  onLoad: function(options: any): void {
      homesettingPage = this

      let homeData = getHomeSettingData()
      if (homeData) {
          homesettingPage.setData({
              homeData: homeData,
              addressText: homeData.addressText,
          })
          clearHomeSettingData()
      }
  },

  onShow: function (): void {
      getAddressCities((cities: Array<Address>) => {
          homesettingPage.setData({
              addressText: getAddressDisplayText(cities),
          })
      }, (failure) => {
          // do nothing
      })
  },

  formSubmit: (e) => {
      let nickname = e.detail.value.nickname
      if (trim(nickname).length === 0) {
          showErrDialog('昵称不能为空')
          return
      }

      let intro = e.detail.value.intro
      if (intro.length > 70) {
          showErrDialog('简介不能超过 70 个字')
          return
      }

      showLoading('正在更新')
      let imageModified = homesettingPage.data.imageModified
      let avatar = homesettingPage.data.homeData.avatar
      if (imageModified && avatar && avatar !== '') {
          // upload avatar first
          initQiniu()
          getUploadToken((token: string) => {
              if (token) {
                  uploadFile(avatar, (success) => {
                      let avatarUrl = success.imageURL
                      homesettingPage.updateHomeData(nickname, intro, avatarUrl)
                  }, () => {
                      hideLoading()
                      showErrDialog('上传头像失败，请稍后再试')
                  }, {
                      // TODO 放到服务端
                      region: 'ECN',
                      imageURLPrefix: 'pic.youdushufang.com',
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
      } else {
          homesettingPage.updateHomeData(nickname, intro, '')
      }
  },

  updateHomeData: (nickname: string, intro: string, avatar: string) => {
      updateHomeData(nickname, intro, avatar, (result: string) => {
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
                  let homeData = homesettingPage.data.homeData
                  homeData.avatar = res.tempFilePaths[0]
                  homesettingPage.setData({
                      homeData: homeData,
                      imageModified: true,
                  })
              }
          },
      })
  },
  
  onSettingAddress: (e) => {
      wx.navigateTo({
          url: './address',
      })
  },
})
