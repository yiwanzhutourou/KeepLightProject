function parseBookInfo(data) {
    return {
        title: data.title,
        author: data.author,
        url: data.alt,
        cover: data.image
    }
}

module.exports = {
    parseBookInfo: parseBookInfo 
}