import { User } from '../api/interfaces'

let refreshCard = false
let libBorrowUser = {}

export const needRefreshCard = () => {
    return refreshCard
}

export const updateNeedRefreshCard = (refresh: boolean) => {
    refreshCard = refresh
}

export const getLibBorrowUser = () => {
    return libBorrowUser
}

export const setLibBorrowUser = (user: User) => {
    libBorrowUser = user
}
