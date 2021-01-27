export const checkLogin = () => {
    const id = localStorage.getItem("user_id")
    const username = localStorage.getItem("username")
    if (id && username) return true
    else return false
}

export const setStorage = (type, value) => {
    localStorage.setItem(type, value)
}

export const getStorage = type => {
    return localStorage.getItem(type)
}

export const resetStorage = () => {
    localStorage.clear()
}
