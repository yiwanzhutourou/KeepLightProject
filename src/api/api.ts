import { Address, Callback } from '../test/backend'
import {
    addAddressApi,
    getAddressApi,
    getUserInfoApi,
    removeAddressApi,
    setUserInfoApi,
} from '../test/backend'

export const setUserInfo = (info: string, cb: Callback) => {
    setUserInfoApi(info, cb)
}

export const getUserInfo = (cb: Callback) => {
    getUserInfoApi(cb)
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
