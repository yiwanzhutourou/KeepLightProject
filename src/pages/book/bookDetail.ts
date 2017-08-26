import { getBookDetailData } from '../../utils/bookCache'

let bookDetailPage

Page({
  data: {
      detailContent: '',
  },

  onLoad: function(option: any): void {
      bookDetailPage = this

      let bookDetailData = getBookDetailData()
      if (bookDetailData) {
          if (bookDetailData.title) {
              wx.setNavigationBarTitle({
                  title: bookDetailData.title,
              })
            }
            bookDetailPage.setData({
                detailContent: bookDetailData.content,
            })
      }
  },
})
