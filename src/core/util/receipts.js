import { api } from "../api";

export async function uploadReceiptImage(uri) {

    const formData = new FormData()

    formData.append('file', {
        uri: uri,
        name: 'receipt.jpg',
        type: 'image/jpg'
    })

    const { data } = await api.post('/receipts/upload', formData, { headers: { "Content-Type": 'multipart/form-data' } })

    return data
}