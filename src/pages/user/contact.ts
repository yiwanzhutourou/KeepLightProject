import { getUserContact, setUserContact } from '../../api/api'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

import { UserContact } from '../../api/interfaces'
import { verifyReg } from '../../utils/reg'

let contactPage

const CONTACT_WECHAT = 0
const CONTACT_QQ = 1
const CONTACT_MAIL = 2

Page({
  data: {
      method: '',
      contact: '',
      methodRange: [
          '微信', 'QQ', '邮箱',
      ],
      methodIndex: CONTACT_WECHAT,
      settingItem: {
        title: '',
        subTitle: '',
        hideArrow: true,
      },
      inputContact: '',
  },

  onLoad: function(options: any): void {
    contactPage = this

    showLoading('正在加载数据...')
    getUserContact((result: UserContact) => {
        hideLoading()
        contactPage.fillContact(result.name, result.contact)
    }, (failure) => {
        hideLoading()
        if (!failure.data) {
            showConfirmDialog('提示', '无法获取数据，请检查你的网络状态', (confirm) => {
                if (confirm) {
                    wx.navigateBack({
                        delta: 1,
                    })
                }
            }, false)
        }
    })
  },

  bindPickerChange: (e) => {
      contactPage.clearInput()
      contactPage.setData({
          methodIndex: e.detail.value,
      })
  },

  formSubmit: (e) => {
      let contact = e.detail.value.contact_input
      if (contact === '') {
          showErrDialog('请输入你的联系方式')
          return
      }

      let pickerIndex = Number(e.detail.value.contact_picker)
      switch (pickerIndex) {
          case CONTACT_WECHAT:
            // 检查微信是否合法
            if (!verifyReg(contact, 'wechat')) {
                showErrDialog('请输入正确的微信号')
                return
            }
            break
          case CONTACT_QQ:
            // 检查QQ是否合法
            if (!verifyReg(contact, 'qq')) {
                showErrDialog('请输入正确的QQ号')
                return
            }
            break
          case CONTACT_MAIL:
            // 检查邮箱是否合法
            if (!verifyReg(contact, 'email')) {
                showErrDialog('请输入正确的邮箱地址')
                return
            }
            break
          default:
      }

      showLoading('正在更新你的联系方式')
      setUserContact(contactPage.data.methodRange[pickerIndex], contact,
        (result: UserContact) => {
            hideLoading()
            contactPage.fillContact(result.name, result.contact)
        }, (failure) => {
            hideLoading()
            if (!failure.data) {
                showErrDialog('无法获取数据，请检查你的网络状态')
            }
        })
  },

  onSettingItemTap: (e) => {
      showConfirmDialog('删除确认', '删除联系方式之后，将不能回复书友的借书请求，确认继续？', (confirm: boolean) => {
          if (confirm) {
            showLoading('正在删除...')
            setUserContact('', '',
                (result: UserContact) => {
                    hideLoading()
                    contactPage.fillContact(result.name, result.contact)
                }, (failure) => {
                    hideLoading()
                    if (!failure.data) {
                        showErrDialog('无法删除，请检查你的网络状态')
                    }
                })
          }
      })
  },
  
  fillContact: (name: string, contact: string) => {
      if (name && contact) {
          contactPage.setData({
            method: name,
            contact: contact,
            settingItem: {
                title: '已设置' + name,
                subTitle: contact,
                subInfo: '点击可以删除',
                hideArrow: true,
            },
          })
      } else {
          contactPage.setData({
            method: name,
            contact: contact,
            settingItem: {},
          })
      }
  },

  onClearContact: (e) => {
      contactPage.clearInput()
  },

  clearInput: () => {
      contactPage.setData({
          inputContact: '',
      })
  },
})
