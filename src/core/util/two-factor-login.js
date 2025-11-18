import { api } from "../api";

export async function twoFactorValidation(code, verifier) {

    try {
        const response = await api.post('/login', { code, verifier })
        return response.data
    } catch (error) {
        throw error.response?.data ?? error
    }
}