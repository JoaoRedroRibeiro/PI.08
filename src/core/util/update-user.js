import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api";

export async function updateProfile(userId, userData) {

    console.log(new Date(userData.birthDate).toISOString().split('T')[0])
    const token = await AsyncStorage.getItem('RB_AT')
    const response = await api.patch(`/users/${userId}`, {
        "email": userData.email,
        "full_name": userData.name,
        "phone_number": userData.phone,
        "birthdate": userData.birthDate,
        "profession": userData.profession,
        "address": userData.address,
        "city": userData.city
    }, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    return response.data
}