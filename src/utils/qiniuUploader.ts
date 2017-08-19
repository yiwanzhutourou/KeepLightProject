
export type QiniuConfig = {
    region: string,
    imageURLPrefix: string,
    uploadToken?: string,
    shouldUseQiniuFileName: boolean,
    key?: string,
}

let config : QiniuConfig = {
    region: '',
    imageURLPrefix: '',
    uploadToken: '',
    shouldUseQiniuFileName: false,
}

// 在整个程序生命周期中，只需要 init 一次即可
// 如果需要变更参数，再调用 init 即可
export const initUploader = (options: QiniuConfig) => {
    config = {
        region: '',
        imageURLPrefix: '',
        uploadToken: '',
        shouldUseQiniuFileName: false,
    }
    updateConfigWithOptions(options)
}

export const updateConfigWithOptions = (options: QiniuConfig) => {
    if (options.region) {
        config.region = options.region
    } else {
        console.error('qiniu uploader need your bucket region')
    }
    if (options.uploadToken) {
        config.uploadToken = options.uploadToken
    }
    if (options.imageURLPrefix) {
        config.imageURLPrefix = options.imageURLPrefix
    }
    config.shouldUseQiniuFileName = options.shouldUseQiniuFileName
}

export const uploadFile = (filePath: string,
    success: (res: any) => void, fail: (res: any) => void, options: QiniuConfig) => {
    if (null == filePath) {
        console.error('qiniu uploader need filePath to upload')
        return
    }
    if (options) {
        updateConfigWithOptions(options)
    }
    if (config.uploadToken && config.uploadToken.length > 0) {
        doUpload(filePath, success, fail, options)
    } else {
        console.error('qiniu uploader need upload token')
        return
    }
}

const doUpload = (filePath: string,
    success: (res: any) => void, fail: (res: any) => void, options: QiniuConfig) => {
    let url = uploadURLFromRegionCode(config.region)
    let fileName = filePath.split('//')[1]
    if (options && options.key) {
        fileName = options.key
    }
    let formData: any = {
        'token': config.uploadToken,
    }
    if (!config.shouldUseQiniuFileName) {
      formData.key = fileName
    }
    wx.uploadFile({
        url: url,
        filePath: filePath,
        name: 'file',
        formData: formData,
        success: (res) => {
          let dataString = res.data
          try {
            let dataObject = JSON.parse(dataString)
            let imageUrl = config.imageURLPrefix + '/' + dataObject.key
            dataObject.imageURL = imageUrl
            if (success) {
                success(dataObject)
            }
          } catch (e) {
            console.log('parse JSON failed, origin String is: ' + dataString)
            if (fail) {
              fail(e)
            }
          }
        },
        fail: (error) => {
            console.error(error)
            if (fail) {
                fail(error)
            }
        },
    })
}

const uploadURLFromRegionCode = (code) => {
    let uploadURL = ''
    switch (code) {
        case 'ECN':
            uploadURL = 'https://up.qbox.me'
            break
        case 'NCN':
            uploadURL = 'https://up-z1.qbox.me'
            break
        case 'SCN':
            uploadURL = 'https://up-z2.qbox.me'
            break
        case 'NA':
            uploadURL = 'https://up-na0.qbox.me'
            break
        default: console.error('please make the region is with one of [ECN, SCN, NCN, NA]');
    }
    return uploadURL
}
