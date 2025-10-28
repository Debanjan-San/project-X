export let users = []

export const findUser = (id) => {
    return users.find((u) => u.lid === id || u.jid === id) || null
}

export const loadDB = async () => {
    for (const user of (await global.DB.get('users')) || []) {
        users.push(user)
    }
}

export const getUserName = (id) => users.find((u) => u.jid === id || u.lid === id)?.name || null

export const isRegUser = (id) => {
    const user = users.find((u) => u.jid === id || u.lid === id)
    return Boolean(user)
}

export const editUser = (jid, updates) => {
    const userIndex = users.findIndex((u) => u.jid === jid || u.lid === jid)
    if (userIndex === -1) return false
    users[userIndex] = { ...users[userIndex], ...updates }
    global.DB.set('users', users)
    return true
}

export const setUser = ({ age, name, gender, jid, lid }) => {
    if (isRegUser(jid)) {
        return false
    }
    const userData = {
        lid,
        jid,
        name,
        age,
        gender,
        rf: false,
        relationship: {
            name: '',
            status: false,
            lid: '',
            jid: '',
            date: 0
        },
        rfcode: '',
        rflist: [],
        ban: {
            status: false,
            resaon: '',
            dateOfLogin: 0
        },
        bank: 0,
        dateOfLogin: new Date().toISOString()
    }
    users.push(userData)
    global.DB.set('users', users)

    return true
}

export const getUsersByGender = (gender) => users.filter((u) => u.gender?.toLowerCase() === gender.toLowerCase())

export const getUsersByRf = () => users.filter((u) => u.rf == true)
