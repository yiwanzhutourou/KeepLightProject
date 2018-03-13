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
    return rpx * res.windowWidth / 750
}

export const timestamp2Text = (timestamp: number) => {
    let minute = 1000 * 60
    
    let now = new Date()
    let diffValue = now.getTime() - timestamp * 1000
    if (diffValue < 0) {
        return '刚刚'
    }

    let today = new Date()
    today.setHours(0, 0, 0, 0)

    let yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    // 2天以上返回日期
    if (timestamp * 1000 < yesterday.getTime()) {
        return parseTimeToDate(timestamp)
    } else if (timestamp * 1000 < today.getTime()) {
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

    let today = new Date()
    today.setHours(0, 0, 0, 0)

    let yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    // 2天以上返回日期
    if (timestamp * 1000 < yesterday.getTime()) {
        return parseTimeToDate(timestamp) + ' ' + parseTimeToHour(timestamp)
    } else if (timestamp * 1000 < today.getTime()) {
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
    return year + '-' + (month < 10 ? '0' + month : month) + '-'
        + (day < 10 ? '0' + day : day)
}

export const getDay = (timestamp: number) => {
    let date = new Date(timestamp * 1000)
    return date.getDay()
}

export const trim = (str: string): string => {
    let result
    result = str.replace(/(^\s+)|(\s+$)/g, '')
    result = result.replace(/\s/g, '')
    return result
}
