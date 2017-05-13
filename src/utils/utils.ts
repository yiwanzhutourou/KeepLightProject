export const showDialog = (content: string) => {
    wx.showModal({
        title: '提示',
        content: content,
        showCancel: false,
    })
}

export const showLoading = (title: string) => {
    wx.showLoading({
        title: title,
        mask: false,
    })
}

export const hideLoading = () => {
    wx.hideLoading()
}
