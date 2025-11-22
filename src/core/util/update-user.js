import { api } from "../api";

export async function updateProfile(userId, userData) {

    const [day, month, year] = userData.birthDate.split('/')
    const response = await api.patch(`/users/${userId}`, {
        "email": userData.email,
        "full_name": userData.name,
        "phone_number": userData.phone,
        "birthdate": `${year}-${month}-${day}`,
        "profession": userData.profession,
        "address": userData.address,
        "city": userData.city
    })

    return response.data
}