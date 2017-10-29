
const MAN_SCAN = 0
const MAN_ADD_BOOK = 1
const MAN_INFO_SETTING = 2
const MAN_SERVICE_SETTING = 3
const MAN_SHOW_BOOKS = 4
const MAN_SHOW_HOME = 5

let managelibPage

Page({
  data: {
    libId: '',
    settingItems: [
        {
            id: MAN_SCAN,
            title: '扫码',
        },
        {
            id: MAN_ADD_BOOK,
            title: '添加图书',
        },
        {
            id: MAN_INFO_SETTING,
            title: '图书馆信息修改',
            subTitle: '简介，图标等基本设置',
        },
        {
            id: MAN_SERVICE_SETTING,
            title: '图书馆后台设置',
            subTitle: '是否开启自助服务，默认还书期限等',
        },
        {
            id: MAN_SHOW_BOOKS,
            title: '查看图书',
            subTitle: '查看库存/外借图书',
        },
        {
            id: MAN_SHOW_HOME,
            title: '查看图书馆主页',
        },
    ],
  },

  onLoad: function(options: any): void {
    managelibPage = this

    if (!options || !options.id) {
        wx.navigateBack({
            delta: 1,
        })
        return
    }
    managelibPage.setData({
        libId: options.id,
    })
  },

  onSettingItemTap: (e) => {
      let id = e.currentTarget.dataset.id
      let libId = managelibPage.data.libId
      switch (id) {
          case MAN_SCAN:
            break
          case MAN_ADD_BOOK:
            break
          case MAN_INFO_SETTING:
            wx.navigateTo({
                url: './libsetting?id=' + libId,
            })
            break
          case MAN_SERVICE_SETTING:
            break
          case MAN_SHOW_BOOKS:
            break
          case MAN_SHOW_HOME:
            break
          default:
      }
  },
})
