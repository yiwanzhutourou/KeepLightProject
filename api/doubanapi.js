function getBookInfo(isbn, cb) {
    // 从豆瓣获取图书信息
    wx.request({
        url: 'https://api.douban.com/v2/book/isbn/' + isbn,
        method: 'GET',
        success: function(res){
            console.log(res)
            cb(true, res.data, res.statusCode)
        },
        fail: function(res) {
            console.log(res)
            cb(false, null, null)
        },
    })
}

module.exports = {
    getBookInfo: getBookInfo  
}