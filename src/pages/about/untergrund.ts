import { DEFAULT_BASE_URL, TEST_BASE_URL, getBaseUrl, setBaseUrl } from '../../api/api'
import { addUrlToList, getUrlList } from '../../utils/urlCache'

import { showDialog } from '../../utils/utils'

let unterPage

Page({
  data: {
    items: [
      { name: '线上服务器', value: DEFAULT_BASE_URL },
      { name: '测试服务器', value: TEST_BASE_URL },
    ],
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
})

const formatUrl = (url: string) => {
  if (!url.match('^http')) {
    url = 'http://' + url
  }
  url += '/api/'
  return url
}
