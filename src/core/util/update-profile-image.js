import { api } from "../api";

export async function updateProfileImage(userId, image) {

    const formData = new FormData()

    formData.append('image', {
        type: 'image/jpeg',
        uri: image,
        name: 'profile.jpeg'
    })

    await api.patch(`/users/${userId}/profile_image`, formData, {
        headers: {
            "Content-Type": 'multipart/form-data'
        }
    })
}