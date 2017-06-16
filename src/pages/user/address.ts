import { addAddress, getAddress, removeAddress } from '../../api/api'
import { hideLoading, showConfirmDialog, showLoading, showToast } from '../../utils/utils'

import { Address } from '../../api/interfaces'

let addressPage

Page({
  data: {
    addresses: [],
  },

  onLoad: function(options: any): void {
    addressPage = this
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
        })
      }
    })
  },
})
