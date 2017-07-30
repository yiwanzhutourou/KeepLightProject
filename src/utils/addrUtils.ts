import { Address, CityInfo } from '../api/interfaces'

export const getCityString = (city: CityInfo) => {
    if (!city) {
        return ''
    }
    if (city.province === city.city) {
        return removeLastChar(city.city) + city.district
    } else {
        return removeLastChar(city.province) + removeLastChar(city.city) + city.district
    }
}

export const getCityShortString = (city: CityInfo) => {
    if (!city) {
        return ''
    }
    if (city.province === city.city) {
        return removeLastChar(city.city)
    } else {
        return removeLastChar(city.province) + removeLastChar(city.city)
    }
}

export const getAddressDisplayText = (addressList: Array<Address>) => {
    if (!addressList || addressList.length == 0) {
        return ''
    }

    let result = new Array<string>()
    addressList.forEach((address) => {
        let cityText = getCityShortString(address.city)
        if (cityText) {
            result.push(cityText)
        }
    })

    let resultString = ''
    result.forEach((cityString) => {
        if (resultString.indexOf(cityString) === -1) {
            resultString += cityString + ' '
        }
    })

    if (resultString === '') {
        return addressList[0].name ? addressList[0].name : addressList[0].detail
    }

    return resultString
}

export const removeLastChar = (text: string) => {
    if (text) {
        return text.substring(0, text.length - 1)
    }
    return text
}
