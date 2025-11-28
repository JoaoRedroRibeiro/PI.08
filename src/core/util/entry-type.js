import { api } from '../api'

export async function getEntryTypes() {
    const { data } = await api.get('/entry_types/')
    return data
}

export async function createEntryType(name) {
    const { data } = await api.post('/entry_types/', { name })
    return data
}

export async function updateEntryType(name, entryTypeId) {
    const { data } = await api.patch(`/entry_types/${entryTypeId}`, { name })
    return data
}

export async function getEntryType(entryTypeId) {
    const { data } = await api.get(`/entry_types/${entryTypeId}`)
    return data
}