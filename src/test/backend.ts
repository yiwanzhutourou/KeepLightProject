// var Promise = require('../utils/es6-promise.min').Promise

const USER_INFO_KEY = 'user_info'
const ADDRESS_KEY = 'address'

export type Address = {
    name: string,
    longitude: number,
    latitude: number,
}

export type Callback = (success: boolean, errMsg: string, result?: any) => void

export const setUserIntroApi = async (intro: string, cb: Callback) => {
    try {
        await wx.setStorageSync(USER_INFO_KEY, intro)
        cb(true, '', intro)
    } catch (e) {
        cb(false, '设置简介失败')
    }
}

export const getUserIntroApi = async (cb: Callback) => {
    try {
        let intro = await wx.getStorageSync(USER_INFO_KEY)
        cb(true, '', intro)
    } catch (e) {
        cb(false, '获取简介失败', '')
    }
}

export const addAddressApi = async (address: Address, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(ADDRESS_KEY) || []
    } catch (e) {
        cb(false, '无法获取地址')
        return
    }
    all.unshift(address)
    await wx.setStorageSync(ADDRESS_KEY, all)
    cb(true, '')
}

export const getAddressApi = async (cb: Callback) => {
    try {
        let all = await wx.getStorageSync(ADDRESS_KEY) || []
        cb(true, '', all)
    } catch (e) {
        cb(false, '无法获取地址', [])
    }
}

export const removeAddressApi = async (address: Address, cb: Callback) => {
    let all
    try {
        all = await wx.getStorageSync(ADDRESS_KEY) || []
    } catch (e) {
        cb(false, '无法获取地址')
        return
    }
    if (address && all && all.length > 0) {
        for (let i = all.length - 1; i >= 0; i--) {
            let addr = all[i] as Address
            if (addr && addr.name === address.name
                && addr.longitude === address.longitude
                && addr.latitude === address.latitude) {
                    all.splice(i, 1)
                    await wx.setStorageSync(ADDRESS_KEY, all)
                    cb(true, '删除成功')
                    return
            }
        }
    }
    cb(false, '地址不存在，无法删除')
}
