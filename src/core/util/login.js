import { api } from '../api'

export async function loginWithEmail(email, password) {
    try {
        const response = await api.post('/request_login/', { email, password })
        return response.data
    } catch (error) {
        throw error.response?.data ?? error
    }
}
