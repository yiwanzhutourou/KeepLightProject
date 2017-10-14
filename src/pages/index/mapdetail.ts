import { SearchUser } from '../../api/interfaces'
import { getDistrictShortString } from '../../utils/addrUtils'
import { getMapDetails } from '../../api/api'

const formatUserList = (users: Array<SearchUser>) => {
  if (users && users.length > 0) {
    users.forEach((user: SearchUser) => {
        if (user.address) {
            user.addressText = user.address.city
                      ? getDistrictShortString(user.address.city) : user.address.detail
        } else {
            user.addressText = '暂无地址'
        }
    })
  }
  return users
}

Page({
  data: {
    bookshelves: [],
  },

  onLoad: function(option): void {
    // 获取书房信息
    const users = option.users

    const that = this
    getMapDetails(
      users,
      (result: Array<SearchUser>) => {
        that.setData({ bookshelves: formatUserList(result) })
      }
    )
  },

  onUserItemTap: (e) => {
    wx.navigateTo({
        url: '../homepage/homepage2?user=' + e.currentTarget.dataset.user,
    })
  },

  onShow: function(): void {

  },

})
