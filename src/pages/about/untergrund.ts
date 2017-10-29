import { DEFAULT_BASE_URL, TEST_BASE_URL, clearUserData, clearUserToken, getBaseUrl, setBaseUrl } from '../../api/api'
import { addUrlToList, clearShowGuide, clearShowLanding, getUrlList } from '../../utils/urlCache'
import { hideLoading, showConfirmDialog, showDialog, showErrDialog, showLoading } from '../../utils/utils'

let unterPage

const SETTING_LIBRARY = 1

Page({
  data: {
    items: [
      { name: '线上服务器', value: DEFAULT_BASE_URL },
      { name: '测试服务器', value: TEST_BASE_URL },
    ],
    settingItem: {
      id: SETTING_LIBRARY,
      title: '图书馆后台',
    },
  },

  onLoad: function(options: any): void {
    unterPage = this
    let items = unterPage.data.items
    let selfItems = getUrlList()
    if (selfItems.length > 0) {
      items = items.concat(selfItems)
    }
    items.forEach((item) => {
      if (item && item.value === getBaseUrl()) {
        item.checked = 'true'
      }
    })
    unterPage.setData({
      items: items,
    })
  },

  radioChange: (e) => {
    if (e.detail.value) {
      setBaseUrl(e.detail.value)
      showDialog('已设置服务器地址为: ' + e.detail.value)
    }
  },

  formSubmit: (e) => {
      let url = e.detail.value.server_input
      if (url) {
        let items = unterPage.data.items
        let item = {
          name: url,
          value: formatUrl(url),
        }
        items.push(item)
        addUrlToList(item)
        unterPage.setData({
          items: items,
        })
      }
  },

  onClearUser: (e) => {
    showConfirmDialog('提示', '会清空当前登录的用户的所有地址、联系方式、绑定的手机号、书房简介，是否继续？',
        (confirm) => {
            if (confirm) {
              showLoading('正在操作...')
              clearUserData((result: string) => {
                hideLoading()
                if (result === 'ok') {
                  clearUserToken()
                  clearShowGuide()
                  showDialog('成功')
                }
              }, () => {
                hideLoading()
                showErrDialog('网络出错了')
              })
            }
        })
  },

  onResetLanding: (e) => {
    clearShowLanding()
    showDialog('已重置')
  },

  onSettingItemTap: (e) => {
    let id = e.currentTarget.dataset.id
    switch (id) {
      case SETTING_LIBRARY:
        wx.navigateTo({
          url: '../lib/mylibs',
        })
        break
      default:
        break
    }
  },
})

const formatUrl = (url: string) => {
  if (!url.match('^http')) {
    url = 'http://' + url
  }
  url += '/api/'
  return url
}
