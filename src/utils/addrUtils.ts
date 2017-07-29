import { CityInfo } from '../api/interfaces'

export const getCityString = (city: CityInfo) => {
    if (city.province === city.city) {
        return city.city + city.district
    } else {
        return city.province + city.city + city.district
    }
}