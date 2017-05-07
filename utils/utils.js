function showDialog(content) {
    wx.showModal({
        title: '提示',
        content: content,
        showCancel: false
    })
}

function showLoading(title) {
    wx.showLoading({
        title: title
    })
}

function hideLoading() {
    wx.hideLoading()
}

module.exports = {
    showDialog: showDialog,
    showLoading: showLoading,
    hideLoading: hideLoading  
}