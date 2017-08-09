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

// TODO：不知道为什么iphone上显示不出来，可以自己做一个toast
export const showToast = (title: string) => {
    wx.showToast({
        title: title,
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

export const timestamp2Text = (timestamp: number) => {
    let minute = 1000 * 60
    let hour = minute * 60
    let day = hour * 24

    let now = new Date().getTime()
    let diffValue = now - timestamp * 1000
    if (diffValue < 0) {
        return '刚刚'
    }
    // 2天以上返回日期
    if ((diffValue / (2 * day)) >= 1) {
        return parseTimeToDate(timestamp)
    } else if ((diffValue / day) >= 1) {
        return '昨天 ' + parseTimeToHour(timestamp)
    } else if ((diffValue / minute) < 1) {
        return '刚刚'
    } else {
        return parseTimeToHour(timestamp)
    }
}

export const timestamp2TextComplex = (timestamp: number) => {
    let minute = 1000 * 60

    let now = new Date()
    let diffValue = now.getTime() - timestamp * 1000
    if (diffValue < 0) {
        return '刚刚'
    }
    
    // 2天以上返回日期
    let today = now.getDay()
    let lastDay = getDay(timestamp)
    if (today - lastDay > 1) {
        return parseTimeToDate(timestamp) + ' ' + parseTimeToHour(timestamp)
    } else if (today - lastDay > 0) {
        return '昨天 ' + parseTimeToHour(timestamp)
    } else if ((diffValue / minute) < 1) {
        return '刚刚'
    } else {
        return parseTimeToHour(timestamp)
    }
}

export const parseTimeToHour = (timestamp: number) => {
    let date = new Date(timestamp * 1000)
    let hour = date.getHours()
    let minute =  date.getMinutes()
    let minuteText = minute < 10 ? '0' + minute : minute
    if (hour > 18) {
        return '晚上' + (hour - 12) + ':' + minuteText
    } else if (hour >= 12) {
        return '下午' + (hour - 12) + ':' + minuteText
    } else if (hour > 6) {
        return '上午' + hour + ':' + minuteText
    } else {
        return '凌晨' + hour + ':' + minuteText
    }
}

export const parseTimeToDate = (timestamp: number) => {
    let date = new Date(timestamp * 1000)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    return year + '/' + month + '/' + day
}

export const getDay = (timestamp: number) => {
    let date = new Date(timestamp * 1000)
    return date.getDay()
}
