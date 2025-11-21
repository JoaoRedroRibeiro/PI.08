import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../api'

export async function loadUserData(userId) {

    const token = await AsyncStorage.getItem('RB_AT')

    const response = await api.get(`/users/${userId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    return response.data

}