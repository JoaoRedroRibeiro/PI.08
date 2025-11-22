import { api } from '../api'

export async function loadUserData(userId) {

    const response = await api.get(`/users/${userId}`)
    return response.data

}