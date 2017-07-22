import { addAddress, getAddress, removeAddress } from '../../api/api'
import { hideLoading, showConfirmDialog, showErrDialog, showLoading, showToast } from '../../utils/utils'

import { Address } from '../../api/interfaces'

let addressPage

Page({
  data: {
    delBtnWidth: 180, // 删除按钮宽度单位rpx
    addresses: [],
  },

  onLoad: function(options: any): void {
    addressPage = this
    addressPage.initEleWidth()
    addressPage.loadData()
  },

  loadData: () => {
    showLoading('正在加载')
    getAddress((list: Array<Address>) => {
      hideLoading()
      addressPage.setData({
        addresses: list,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        showConfirmDialog('提示', '无法获取数据，请检查您的网络状态', (confirm) => {
            if (confirm) {
                wx.navigateBack({
                    delta: 1,
                })
            }
        }, false)
      }
    })
  },

  onAddressItemTap: (e) => {
    let address = e.currentTarget.dataset.address
    if (address.latitude && address.longitude) {
      wx.openLocation({
        latitude: address.latitude,
        longitude: address.longitude,
        name: address.name,
        address: address.detail,
      })
    }
  },

  onAddAddress: (e) => {
    wx.chooseLocation({
      success: (res: WeApp.ChoosedLoaction) => {
        showLoading('正在添加地址')
        addAddress({
          name: res.name,
          detail: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
        }, (name: string) => {
          hideLoading()
          addressPage.loadData()
        }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法获取数据，请检查您的网络状态')
          }
        })
      },
    })
  },

  onRemoveAddress: (e) => {
    showConfirmDialog('', '确认删除地址？', (confirm: boolean) => {
      if (confirm) {
        showLoading('正在删除')
        let id = e.currentTarget.dataset.id
        removeAddress(id, (result: number) => {
          hideLoading()
          let list: Array<Address> = []
          if (addressPage.data.addresses) {
            addressPage.data.addresses.forEach((address: Address) => {
              if (id !== address.id) {
                list.push(address)
              }
            })
            addressPage.setData({
              addresses: list,
            })
          }
          showToast('删除成功')
        }, (failure) => {
          hideLoading()
          if (!failure.data) {
            showErrDialog('无法获取数据，请检查您的网络状态')
          }
        })
      }
    })
  },

  touchS: (e) => {
    if (e.touches.length == 1) {
      addressPage.setData({
        startX: e.touches[0].clientX,
      })
    }
  },

  touchM: (e) => {
    if (e.touches.length == 1) {
      let moveX = e.touches[0].clientX
      let disX = addressPage.data.startX - moveX
      let delBtnWidth = addressPage.data.delBtnWidth
      let txtStyle = ''
      if (disX == 0 || disX < 0) {
        txtStyle = 'left:0px'
      } else if (disX > 0 ) {
        txtStyle = 'left:-' + disX + 'px'
        if (disX >= delBtnWidth) {
          txtStyle = 'left:-' + delBtnWidth + 'px'
        }
      }
      let index = e.currentTarget.dataset.index
      let list = addressPage.data.addresses
      if (index || index === 0) {
        list[index].txtStyle = txtStyle
        addressPage.setData({
          addresses: list,
        })
      }
    }
  },

  touchE: (e) => {
    if (e.changedTouches.length == 1) {
      let endX = e.changedTouches[0].clientX
      let disX = addressPage.data.startX - endX
      let delBtnWidth = addressPage.data.delBtnWidth
      let show = disX > delBtnWidth / 2
      let txtStyle = show ? 'left:-' + delBtnWidth + 'px' : 'left:0px'
      let index = e.currentTarget.dataset.index
      let list = addressPage.data.addresses
      if (index || index === 0) {
        if (show) {
          if (addressPage.data.lastIndex || addressPage.data.lastIndex === 0) {
            list[addressPage.data.lastIndex].txtStyle = 'left:0px'
          }
          addressPage.setData({
            lastIndex: index,
          })
        }
        list[index].txtStyle = txtStyle
        addressPage.setData({
          addresses: list,
        })
      }
    }
  },

  // 获取元素自适应后的实际宽度
  getEleWidth: (w) => {
    let real = 0
    try {
      let res: any = wx.getSystemInfoSync().windowWidth
      let scale = (750 / 2) / (w / 2) // 以宽度750px设计稿做宽度的自适应
      real = Math.floor(res / scale)
      return real
    } catch (e) {
      return false
    }
  },

  initEleWidth: () => {
    let delBtnWidth = addressPage.getEleWidth(addressPage.data.delBtnWidth)
    addressPage.setData({
      delBtnWidth: delBtnWidth,
    })
  },
})
