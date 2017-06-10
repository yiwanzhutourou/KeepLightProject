export const showDialog = (content: string) => {
    wx.showModal({
        title: '提示',
        content: content,
        showCancel: false,
    })
}

export const showConfirmDialog = (title: string, content: string, success: (confirm: boolean) => void) => {
    wx.showModal({
        title: title,
        content: content,
        success: (res: { confirm: boolean }) => {
            success(res.confirm)
        },
        showCancel: true,
    })
}

export const showErrDialog = (err: string) => {
    wx.showModal({
        title: '提示',
        content: err,
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

export const showToast = (title: string) => {
    wx.showToast({
        title: title,
        duration: 2000,
    })
}
