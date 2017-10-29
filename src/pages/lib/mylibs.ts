import { Library } from '../../api/interfaces'
import { getCityString } from '../../utils/addrUtils'
import { getMyLibs } from '../../api/api'
import { hideLoading } from '../../utils/utils'

let mylibsPage

const formatList = (libs: Array<Library>) => {
  if (libs && libs.length > 0) {
    libs.forEach((lib: Library) => {
      if (lib && lib.address) {
        let addrName = lib.address.name ? lib.address.name : lib.address.detail
        if (lib.address.city) {
          lib.addressText = getCityString(lib.address.city) + ' - ' + addrName
        } else {
          lib.addressText = lib.address.detail + addrName
        }
      }
    })
  }
  return libs
}

Page({
  data: {
    showAll: true,
    dataList: [],
    showNetworkError: false,
    showEmpty: false,
    showList: false,
  },
  
  onLoad: function(option: any): void {
    mylibsPage = this
  },

  onShow: function (): void {
    mylibsPage.loadData()
  },

  loadData: () => {
    // 主页的所有信息打在一个接口里，后面要做图书分页
    getMyLibs((resultList: Array<Library>) => {
      hideLoading()
      mylibsPage.setData({
        dataList: formatList(resultList),
        showEmpty: resultList.length == 0,
        showList: resultList.length > 0,
      })
    }, (failure) => {
      hideLoading()
      if (!failure.data) {
        mylibsPage.setData({
          showNetworkError: true,
        })
      }
    })
  },

  onReload: (e) => {
    mylibsPage.loadData()
  },

  onCreateLib: (e) => {
    wx.navigateTo({
      url: './createlib',
    })
  },

  obLibTap: (e) => {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
        url: './managelib?id=' + id,
    })
  },
})
