export const showDialog = (content: string) => {
    wx.showModal({
        title: '提示',
        content: content,
        showCancel: false,
    })
}

export const showConfirmDialog = (title: string, content: string, success: (confirm: boolean) => void, showCancel = true) => {
    wx.showModal({
        title: title,
        content: content,
        success: (res: { confirm: boolean }) => {
            success(res.confirm)
        },
        showCancel: showCancel,
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

export const getScreenSizeInRpx = () => {
    let res = wx.getSystemInfoSync() as any
    let windowHeight = res.windowHeight * 750 / res.windowWidth
    let windowWidth = res.windowWidth * 750 / res.windowWidth
    return {width: windowWidth, height: windowHeight}
}

export const rpx2px = (rpx: number) => {
    let res = wx.getSystemInfoSync() as any
    return rpx * 750 / res.windowWidth
}
