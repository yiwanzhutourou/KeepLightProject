
let refreshCard = false

export const needRefreshCard = () => {
    return refreshCard
}

export const updateNeedRefreshCard = (refresh: boolean) => {
    refreshCard = refresh
}
