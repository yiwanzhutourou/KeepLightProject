import { hideLoading, showLoading } from '../../utils/utils'
import { legals, rights } from '../../api/api'

let legalsPage

Page({
  data: {
    title: '',
    contents: '',
  },

  onLoad: function(options: any): void {
    legalsPage = this

    if (options && options.content) {
        if (options.content == 'rights') {
            wx.setNavigationBarTitle({
              title: '知识产权声明',
            })
            showLoading('正在加载')
            rights((rights: string) => {
              hideLoading()
              legalsPage.setData({
                title: '知识产权声明',
                contents: rights,
              })
            }, () => {
              hideLoading()
            })
        } else if (options.content == 'legals') {
            wx.setNavigationBarTitle({
              title: '免责申明',
            })
            showLoading('正在加载')
            legals((legals: string) => {
              hideLoading()
              legalsPage.setData({
                title: '免责申明',
                contents: legals,
              })
            }, () => {
              hideLoading()
            })
        }
    }
  },
})
