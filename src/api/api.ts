import { Address, Callback } from '../test/backend'
import {
    addAddressApi,
    getAddressApi,
    getUserIntroApi,
    removeAddressApi,
    setUserIntroApi,
} from '../test/backend'

export const setUserIntro = (intro: string, cb: Callback) => {
    if (!intro) {
        cb(false, '不能设置空的简介')
        return
    }

    if (intro.length > 70) {
        cb(false, '简介不能超过 70 个字')
        return
    }

    setUserIntroApi(intro, cb)
}

export const getUserIntro = (cb: Callback) => {
    getUserIntroApi(cb)
}

export const addAddress = (address: Address, cb: Callback) => {
    addAddressApi(address, cb)
}

export const removeAddress = (address: Address, cb: Callback) => {
    removeAddressApi(address, cb)
}

export const getAddress = (cb: Callback) => {
    getAddressApi(cb)
}
